import Foundation

class DashXLog {
    enum LogLevel: Int {
        case info = 1
        case debug = 0
        case off = -1
                
        static func >= (lhs: Self, rhs: Self) -> Bool {
            return lhs.rawValue >= rhs.rawValue
        }
    }
    
    private var logLevel: LogLevel = .off
    
    func setLogLevel(to: Int) {
        self.logLevel = LogLevel(rawValue: to) ?? .off
    }
    
    func d(tag: String, data: Any) {
        if (logLevel >= .debug) {
            os_log(tag, type: .debug, data)
        }
    }
    
    func i(tag: String, data: Any) {
        if (logLevel >= .info) {
            os_log(tag, type: .info, data)
        }
    }
}

let Logger = DashXLog()
