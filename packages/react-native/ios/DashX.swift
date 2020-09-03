import Foundation

@objc(DashX)
class DashX: NSObject {
    
    @objc
    func setLogLevel(logLevel: Int) {
        Logger.setLogLevel(logLevel)
    }
}
