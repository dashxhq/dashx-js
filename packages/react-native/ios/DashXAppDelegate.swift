import Foundation

@objc(DashXAppDelegate)
class DashXAppDelegate: NSObject {
    static func swizzleDidReceiveRemoteNotification() {
        let appDelegate = UIApplication.shared.delegate
        let appDelegateClass = object_getClass(appDelegate)

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

    static func swizzleDidFinishLaunchingWithOptions() {
        let appDelegate = UIApplication.shared.delegate
        let appDelegateClass = object_getClass(appDelegate)

        let originalSelector = #selector(UIApplicationDelegate.application(_:didFinishLaunchingWithOptions:))
        let swizzledSelector = #selector(DashXAppDelegate.self.handleLaunch(_:didFinishLaunchingWithOptions:))

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

        var properties: [String: [String: Any]] = [ "notification": [:], "data": [:] ]

        DashXLog.d(tag: #function, "Received APN: \(userInfo)")

        guard let remoteMessage = try? FirebaseRemoteMessage(decoding: userInfo) else {
            DashXLog.d(tag: #function, "Non firebase notification received: \(userInfo)")
            return
        }

        properties["notification"]?["title"] = remoteMessage.aps.alert.title
        properties["notification"]?["body"] = remoteMessage.aps.alert.body

        completionHandler(.newData)
        DashXEventEmitter.instance.dispatch(name: "messageReceived", body: properties)
    }

    @objc
    public func handleLaunch(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject : AnyObject]?) -> Bool {
        print("ihandleLaunch \(String(describing: launchOptions))")
        return true
    }
}
