import Foundation

@objc(DashX)
class DashX: NSObject {
    private var dashXClient = DashXClient.instance

    @objc
    func setLogLevel(_ logLevel: Int) {
        Logger.setLogLevel(to: logLevel)
    }

    @objc
    func setup() { }
}
