import Foundation

private let swizzling: (AnyClass, Selector, Selector) -> () = { forClass, originalSelector, swizzledSelector in
    let originalMethod = class_getInstanceMethod(forClass, originalSelector)
    let swizzledMethod = class_getInstanceMethod(forClass, swizzledSelector)
    method_exchangeImplementations(originalMethod!, swizzledMethod!)
}

extension UIViewController {
    static func swizzle() {
        let originalSelector = #selector(viewDidLoad)
        let swizzledSelector = #selector(swizzledViewDidLoad)
        swizzling(UIViewController.self, originalSelector, swizzledSelector)
    }

    @objc func swizzledViewDidLoad() {
        DashXClient.instance.track(Constants.INTERNAL_EVENT_APP_SCREEN_VIEWED, withData: [:])
        // Call the original viewDidLoad - using the swizzledViewDidLoad signature
        swizzledViewDidLoad()
    }
}
