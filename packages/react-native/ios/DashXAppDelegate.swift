import Foundation

@objc(DashXAppDelegate)
class DashXAppDelegate: NSObject {
    static func swizzleDidReceiveRemoteNotification() {
        DispatchQueue.main.async {
            let appDelegate = UIApplication.shared.delegate
            let appDelegateClass = object_getClass(appDelegate)
            
            let originalSelector = #selector(UIApplicationDelegate.application(_:didReceiveRemoteNotification:))
            let swizzledSelector = #selector(
                DashX.self.handleMessage(_:didReceiveRemoteNotification:)
            )
            
            try? swizzler(appDelegateClass!, DashX.self, originalSelector, swizzledSelector)
        }
    }
}
