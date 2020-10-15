import Foundation

@objc(DashXAppDelegate)
class DashXAppDelegate: NSObject {
    static func swizzleDidReceiveRemoteNotification() {
        DispatchQueue.main.async {
            let appDelegate = UIApplication.shared.delegate
            let appDelegateClass = object_getClass(appDelegate)

            let originalSelector = #selector(UIApplicationDelegate.application(_:didReceiveRemoteNotification:))
            let swizzledSelector = #selector(
                DashXAppDelegate.self.handleMessage(_:didReceiveRemoteNotification:)
            )

            try? swizzler(appDelegateClass!, DashXAppDelegate.self, originalSelector, swizzledSelector)
        }
    }

    @objc
    func handleMessage(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any]) {
        var properties: [String: [String: Any]] = [ "notification": [:] ]

        DashXLog.d(tag: #function, "Received APN: \(userInfo)")

        guard let remoteMessage = try? FirebaseRemoteMessage(decoding: userInfo) else {
            DashXLog.d(tag: #function, "Non firebase notification received: \(userInfo)")
            return
        }

        properties["notification"]?["title"] = remoteMessage.aps.alert.title
        properties["notification"]?["body"] = remoteMessage.aps.alert.body

        DashXEventEmitter.instance.dispatch(name: "messageReceived", body: properties)
    }
}
