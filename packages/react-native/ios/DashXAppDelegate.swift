import Foundation

@objc(DashXAppDelegate)
class DashXAppDelegate: NSObject {
    static func swizzleDidReceiveRemoteNotification() {
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

    static func swizzleDidClickLocalNotification() {
        let appDelegate = UNUserNotificationCenter.self
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

        let notificationContent = UNMutableNotificationContent()
        notificationContent.title = "TITLE"
        notificationContent.body = "Test body"
        notificationContent.sound = UNNotificationSound.default

        let request = UNNotificationRequest(identifier: "testNotification", content: notificationContent, trigger: nil)
        let notificationCenter = UNUserNotificationCenter.current()

        notificationCenter.add(request)

        completionHandler(.newData)
    }

    @objc
    func handleLocalNotification(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        DashXLog.d(tag: #function, "Received Local Notification: \(response)")

        UIApplication.shared.applicationIconBadgeNumber = 0
        completionHandler()
    }
}
