import Foundation
import Alamofire

class HttpClient {
    static let shared = HttpClient()
    private var baseUri: String?
    private var publicKey: String?
    private var headers: Dictionary<String, String> = [:]
    private var cacheTimeout: Int?
    private var requestQueueLimit: Int = 5
    private var requestQueue: Queue<DashXRequest<T>>
    
    private init(_ baseUri: String? = nil, _ publicKey: String? = nil) {
        self.baseUri = baseUri
        self.publicKey = publicKey
    }
    
    func create() -> HttpClient {
        return HttpClient(self.baseUri, self.publicKey)
    }
    
    func withBaseUri(_ baseUri: String) -> HttpClient {
        self.baseUri = baseUri
        return self
    }
    
    func withPublicKey(_ publicKey: String) -> HttpClient {
        self.publicKey = publicKey
        return self
    }
    
    func withCache(timeout: Int?) -> HttpClient {
        self.cacheTimeout = timeout
        return self
    }
    
    func withHeaders(_ headers: Dictionary<String, String>) -> HttpClient {
        self.headers = headers
        return self
    }
    
    func addToQueue<T: Encodable>(uri: String, _ requestBody: T, _ onSuccess: @escaping (Data?) -> Void, _ onError: @escaping (Error) -> Void) {
        if(requestQueue.items.count >= requestQueueLimit) {
            requestQueue.items.forEach {
                makeRequest(uri: $0.uri, $0.body, $0.successCallback, $0.errorCallback)
            }
        }
        
        requestQueue.enqueue(element: DashXRequest(uri: uri, body: requestBody, successCallback: onSuccess, errorCallback: onError))
    }
    
    func makeRequest<T: Encodable>(
        uri: String,
        _ requestBody: T,
        _ onSuccess: @escaping (Data?) -> Void,
        _ onError: @escaping (Error) -> Void
    ) {
        let headerDictionary = headers.merging(
            [ "X-Public-Key": publicKey ?? "" ]
        ) { (current, _) in current }
        
        let headers = HTTPHeaders.init(headerDictionary)
        
        let jsonEncoder = JSONEncoder()
        jsonEncoder.keyEncodingStrategy = .convertToSnakeCase
        
        // For debugging
        if let jsonData = try? jsonEncoder.encode(requestBody),
            let jsonString = String(data: jsonData, encoding: .utf8) {
            DashXLog.d(tag: #function, jsonString)
        }
        
        let dashXRequestInterceptor = DashXRequestInterceptor()
        
        AF.request(
            baseUri! + uri,
            method: .post,
            parameters: requestBody,
            encoder: JSONParameterEncoder(encoder: jsonEncoder),
            headers: headers,
            interceptor: dashXRequestInterceptor
        ) { request in
            if let timeout = self.cacheTimeout {
                request.addValue("private, must-revalidate, max-age=\(String(describing: timeout))", forHTTPHeaderField: "Cache-Control")
            }
        }
        .validate()
        .responseJSON { response in switch response.result {
        case .success:
            onSuccess(response.data)
        case let .failure(error):
            onError(error)
            }
        }
    }
}
