import Foundation

@objc(DashX)
class DashX: NSObject {
    
    @objc
    func setLogLevel(logLevel: Int) {
        Logger.setLogLevel(to: logLevel)
    }
    
    @objc
    func setup(logLevel: Int) {
        DashXClient.generateAnonymousUid()
    }
}
