import Foundation
import os.log

class DashXLog {
    enum LogLevel: Int {
        case info = 1
        case debug = 0
        case off = -1
                
        static func <= (lhs: Self, rhs: Self) -> Bool {
            return lhs.rawValue <= rhs.rawValue
        }
        
        static func > (lhs: DashXLog.LogLevel, rhs: DashXLog.LogLevel) -> Bool {
            return lhs.rawValue > rhs.rawValue
        }
    }
    
    private var logLevel: LogLevel = .off
    
    func setLogLevel(to: Int) {
        self.logLevel = LogLevel(rawValue: to) ?? .off
    }
    
    func d(tag: String, data: String) {
        if (logLevel <= .debug && logLevel > .off) {
            if #available(iOS 10.0, *) {
                os_log("%@: %@", type: .debug, tag, data)
            } else {
                print("%@: %@", tag, data)
            }
        }
    }
    
    func i(tag: String, data: String) {
        if (logLevel <= .info && logLevel > .off) {
            if #available(iOS 10.0, *) {
                os_log("%@: %@", type: .info, tag, data)
            } else {
                print("%@: %@", tag, data)
            }
        }
    }
}

let Logger = DashXLog()
