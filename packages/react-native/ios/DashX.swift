import Foundation
import Firebase

@objc(DashX)
class DashX: NSObject {
    private var dashXClient = DashXClient.instance

    @objc
    func setLogLevel(_ logLevel: Int) {
        DashXLog.setLogLevel(to: logLevel)
    }

    @objc
    func setup(_ options: NSDictionary?) {
        dashXClient.setPublicKey(to: options?.value(forKey: "publicKey") as! String)
        
        if let baseUri = options?.value(forKey: "baseUri") {
            dashXClient.setBaseUri(to: baseUri as! String)
        }
        
        InstanceID.instanceID().instanceID { (result, error) in
            if let error = error {
                DashXLog.d("Error fetching remote instance ID: \(error)")
            } else if let result = result {
                DashXLog.d("Firebase initialised with: \(result.token)")
                dashXClient.setDeviceToken(to: result.token)
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
}
