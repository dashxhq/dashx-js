import Foundation

@objc(DashXApplicationLifecycleCallbacks)
class DashXApplicationLifecycleCallbacks: NSObject {
    static let instance = DashXApplicationLifecycleCallbacks()
    let dashXClient = DashXClient.instance
    var startSession: Float? = nil
    
    func enable() {
        let notificationCenter = NotificationCenter.default
        
        notificationCenter.addObserver(self, selector: #selector(appBackgrounded), name: UIApplication.willResignActiveNotification, object: nil)
        
        notificationCenter.addObserver(self, selector: #selector(appResumed), name: UIApplication.willEnterForegroundNotification, object: nil)
                        
        NSSetUncaughtExceptionHandler { exception in
            DashXClient.instance.track(Constants.INTERNAL_EVENT_APP_CRASHED, withData: [ exception : exception.reason ])
        }
        
        appOpened()
    }
    
    @objc
    func appBackgrounded() {
        dashXClient.track(Constants.INTERNAL_EVENT_APP_BACKGROUNDED, withData: [:])
    }
    
    @objc
    func appOpened() {
        let defaults = UserDefaults.standard
        let appVersionKey = Constants.USER_PREFERENCES_KEY_VERSION
        
        let currentVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as! String
        let previousVersion = defaults.string(forKey: appVersionKey)
        
        if previousVersion == nil {
            dashXClient.track(Constants.INTERNAL_EVENT_APP_INSTALLED, withData: [:])
            defaults.set(currentVersion, forKey: appVersionKey)
            defaults.synchronize()
        } else if previousVersion == currentVersion {
            dashXClient.track(Constants.INTERNAL_EVENT_APP_OPENED, withData: [:])
        } else {
            dashXClient.track(Constants.INTERNAL_EVENT_APP_UPDATED, withData: [:])
            defaults.set(currentVersion, forKey: appVersionKey)
            defaults.synchronize()
        }
    }
    
    @objc
    func appResumed() {
        dashXClient.track(Constants.INTERNAL_EVENT_APP_OPENED, withData: [:])
    }
}
