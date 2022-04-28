import Foundation

@objc(DashXAppDelegate)
class DashXAppDelegate: NSObject {
    static func swizzleDidReceiveRemoteNotificationFetchCompletionHandler() {
        let appDelegate = UIApplication.shared.delegate
        let appDelegateClass: AnyClass? = object_getClass(appDelegate)

        let originalSelector = #selector(UIApplicationDelegate.application(_:didReceiveRemoteNotification:fetchCompletionHandler:))
        let swizzledSelector = #selector(DashXAppDelegate.self.handleMessage(_:didReceiveRemoteNotification:fetchCompletionHandler:))

        guard let swizzledMethod = class_getInstanceMethod(DashXAppDelegate.self, swizzledSelector) else {
            return
        }

        if let originalMethod = class_getInstanceMethod(appDelegateClass, originalSelector)  {
            // exchange implementation
            method_exchangeImplementations(originalMethod, swizzledMethod)
        } else {
            // add implementation
            class_addMethod(appDelegateClass, swizzledSelector, method_getImplementation(swizzledMethod), method_getTypeEncoding(swizzledMethod))
        }
    }

    static func swizzleDidReceiveWithCompletionHandler() {
        let appDelegate = UNUserNotificationCenter.current().delegate
        let appDelegateClass: AnyClass? = object_getClass(appDelegate)

        let originalSelector = #selector(UNUserNotificationCenterDelegate.userNotificationCenter(_:didReceive:withCompletionHandler:))
        let swizzledSelector = #selector(DashXAppDelegate.self.handleLocalNotification(_:didReceive:withCompletionHandler:))

        guard let swizzledMethod = class_getInstanceMethod(DashXAppDelegate.self, swizzledSelector) else {
            return
        }

        if let originalMethod = class_getInstanceMethod(appDelegateClass, originalSelector)  {
            // exchange implementation
            method_exchangeImplementations(originalMethod, swizzledMethod)
        } else {
            // add implementation
            class_addMethod(appDelegateClass, swizzledSelector, method_getImplementation(swizzledMethod), method_getTypeEncoding(swizzledMethod))
        }
    }

    // Based on - https://firebase.google.com/docs/cloud-messaging/ios/receive
    @objc
    func handleMessage(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        DashXLog.d(tag: #function, "Received APN: \(userInfo)")

        if let dashx = userInfo["dashx"] as? String {
            let maybeDashxDictionary = dashx.convertToDictionary()

            let notificationContent = UNMutableNotificationContent()
            notificationContent.title = "Title goes here"
            notificationContent.body = "Body goes here"
            notificationContent.sound = UNNotificationSound.default

            var identifier = "dashxNotification"

            if let parsedDashxDictionary = maybeDashxDictionary {
                if let parsedIdentifier = parsedDashxDictionary["id"] as? String {
                    identifier = parsedIdentifier
                } else {
                    completionHandler(.noData)
                    // Do not handle non-DashX notifications
                    return
                }

                if let parsedTitle = parsedDashxDictionary["title"] as? String {
                    notificationContent.title = parsedTitle
                }

                if let parsedBody = parsedDashxDictionary["body"] as? String {
                    notificationContent.body = parsedBody
                }
            }

            let request = UNNotificationRequest(identifier: identifier, content: notificationContent, trigger: nil)
            let notificationCenter = UNUserNotificationCenter.current()

            notificationCenter.add(request)
            let data = ["data": userInfo]
            DashXEventEmitter.instance.dispatch(name: "messageReceived", body: data)
        }

        completionHandler(.newData)
    }

    @objc
    func handleLocalNotification(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        DashXLog.d(tag: #function, "Received Local Notification: \(response)")

        UIApplication.shared.applicationIconBadgeNumber = 0
        completionHandler()
    }
}
