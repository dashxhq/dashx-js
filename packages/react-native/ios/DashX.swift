import Foundation
import FirebaseInstanceID

@objc(DashX)
class DashX: RCTEventEmitter {
    private var dashXClient = DashXClient.instance
    
    override init() {
        super.init()
        DashXEventEmitter.instance.registerEventEmitter(eventEmitter: self)
    }

    @objc
    func setLogLevel(_ logLevel: Int) {
        DashXLog.setLogLevel(to: logLevel)
    }
    
    override func supportedEvents() -> [String] {
       return ["messageReceived"]
    }
    
    @objc
    func handleMessage(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any]) {
        var properties: Dictionary<String, Dictionary<String, Any>> = [ "notification": [:] ]
        
        DashXLog.d(tag: #function, "Received APN: \(userInfo)")
        
        guard let remoteMessage = try? FirebaseRemoteMessage(decoding: userInfo) else {
            DashXLog.d(tag: #function, "Non firebase notification received: \(userInfo)")
            return
        }
        
        properties["notification"]?["title"] = remoteMessage.aps.alert.title
        properties["notification"]?["body"] = remoteMessage.aps.alert.body
        
        DashXEventEmitter.instance.dispatch(name: "messageReceived", body: properties)
    }

    @objc
    func setup(_ options: NSDictionary?) {
        dashXClient.setPublicKey(to: options?.value(forKey: "publicKey") as! String)
        
        
        DashXAppDelegate.swizzleDidReceiveRemoteNotification()
        
        if let baseUri = options?.value(forKey: "baseUri") {
            dashXClient.setBaseUri(to: baseUri as! String)
        }
        
        if let trackAppLifecycleEvents = options?.value(forKey: "trackAppLifecycleEvents"), trackAppLifecycleEvents as! Bool {
            DashXApplicationLifecycleCallbacks.instance.enable()
        }
        
        if let trackScreenViews = options?.value(forKey: "trackScreenViews"), trackScreenViews as! Bool {
            UIViewController.swizzle()
        }

        InstanceID.instanceID().instanceID { (result, error) in
            if let error = error {
                DashXLog.d(tag: #function, "Error fetching remote instance ID: \(error)")
            } else if let result = result {
                DashXLog.d(tag:  #function, "Firebase initialised with: \(result.token)")
                self.dashXClient.setDeviceToken(to: result.token)
            }
        }
    }
    
    @objc(identify:options:)
    func identify(_ uid: String?, _ options: NSDictionary?) {
        try? dashXClient.identify(uid, withOptions: options)
    }
    
    @objc
    func setIdentityToken(_ identityToken: String) {
        dashXClient.setIdentityToken(to: identityToken)
    }
    
    @objc
    func reset() {
        dashXClient.reset()
    }
    
    @objc(track:data:)
    func track(_ event: String, _ data: NSDictionary?) {
        dashXClient.track(event, withData: data)
    }
    
    @objc(screen:data:)
    func screen(_ screenName: String, _ data: NSDictionary?) {
        dashXClient.screen(screenName, withData: data)
    }
}
