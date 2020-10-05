import Foundation
import Alamofire

class DashXRequestInterceptor: RequestInterceptor {
    let retryLimit: Int
    let exponentialBackoffScale: Double = 0.5
    let exponentialBackoffBase: Int = 2
    
    init(_ retryLimit: Int) {
        self.retryLimit = retryLimit
    }
    
    func getTimeDelay(for retryCount: Int) -> TimeInterval {
        var batteryState: UIDevice.BatteryState { UIDevice.current.batteryState }
        switch batteryState {
        case .charging:
            return pow(Double(exponentialBackoffBase), Double(retryCount)) * exponentialBackoffScale
        default:
            return pow(Double(exponentialBackoffBase), Double(retryCount + 1)) * exponentialBackoffScale
        }
    }
    
    func checkMethod(_ request: Request) -> Bool {
        if let httpMethod = request.request?.method,
            httpMethod == .post {
            return true
        } else {
            return false
        }
    }
    
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        if request.retryCount < retryLimit,
            checkMethod(request) {
            let timeDelay = getTimeDelay(for: request.retryCount)
            completion(.retryWithDelay(timeDelay))
        } else {
            completion(.doNotRetry)
        }
    }
}
