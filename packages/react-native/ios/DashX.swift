import Foundation

@objc(DashX)
class DashX: NSObject {
    private var dashXClient = DashXClient.instance

    @objc
    func setLogLevel(_ logLevel: Int) {
        Logger.setLogLevel(to: logLevel)
    }

    @objc
    func setup(_ options: NSDictionary?) {
        dashXClient.setPublicKey(to: options?.value(forKey: "publicKey") as! String)
        
        if let baseUri = options?.value(forKey: "baseUri") {
            dashXClient.setBaseUri(to: baseUri as! String)
        }
    }
    
    @objc(identify:options:)
    func identify(_ uid: String?, _ options: NSDictionary?) {
        try? dashXClient.identify(uid: uid, options: options)
    }
}
