import Foundation
import Alamofire

class HttpClient {
    static let shared = HttpClient()
    private var baseUri: String?
    private var publicKey: String?
    private var headers: Dictionary<String, String> = [:]
    private var cacher = ResponseCacher(behavior: .doNotCache)
    
    private init() {}

    func withBaseUri(_ baseUri: String) -> HttpClient {
        self.baseUri = baseUri
        return self
    }
    
    func withPublicKey(_ publicKey: String) -> HttpClient {
        self.publicKey = publicKey
        return self
    }
    
    func withForcedCache() -> HttpClient {
        self.cacher = ResponseCacher(behavior: .cache)
        return self
    }
    
    func withHeaders(_ headers: Dictionary<String, String>) -> HttpClient {
        self.headers = headers
        return self
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
        
        AF.request(
            baseUri! + uri,
            method: .post,
            parameters: requestBody,
            encoder: JSONParameterEncoder(encoder: jsonEncoder),
            headers: headers
        )
            .cacheResponse(using: cacher)
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
