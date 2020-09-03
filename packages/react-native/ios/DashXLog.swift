import Foundation

class DashXLog {
    enum LogLevel: Int {
        case info = 1
        case debug = 0
        case off = -1
        
        func lookup () -> Int { return self.rawValue }
    }
    
    private let logLevel = LogLevel.off
    
    func setLogLevel(logLevel: Int) {
        self.logLevel = logLevel
    }
    
    func d(tag: String, data: Any) {
        if (logLevel.lookup() >= LogLevel.debug) {
            os_log(tag, type: .debug, data)
        }
    }
    
    func i(tag: String, data: Any) {
        if (logLevel.lookup() >= LogLevel.info) {
            os_log(tag, type: .info, data)
        }
    }
}

let Logger = DashXLog()
