import Foundation
import Alamofire

class DashXRequestInterceptor: RequestInterceptor {
    let retryLimit: Int
    let exponentialBackoffScale: Double = 0.5
    let exponentialBackoffBase: Int = 2
    
    init(_ retryLimit: Int) {
        self.retryLimit = retryLimit
    }
    
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        if request.retryCount < retryLimit,
            let httpMethod = request.request?.method,
            httpMethod == .post {
            let timeDelay = pow(Double(exponentialBackoffBase), Double(request.retryCount)) * exponentialBackoffScale
            completion(.retryWithDelay(timeDelay))
        } else {
            completion(.doNotRetry)
        }
    }
}
