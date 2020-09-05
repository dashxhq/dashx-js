import Foundation
import Alamofire

enum DashXClientError: Error {
    case noArgsInIdentify
}

class DashXClient {
    static let instance = DashXClient()
    private var anonymousUid: String?
    private var publicKey: String?
    private var uid: String?
    private var baseUri: String = "https://api.dashx.com/v1"

    private init() {
        generateAnonymousUid()
    }
    
    func setBaseUri(to: String) {
        self.baseUri = to
    }
    
    func setPublicKey(to: String) {
        self.publicKey = to
    }

    private func generateAnonymousUid() {
        let preferences = UserDefaults.standard
        let anonymousUidKey = Constants.USER_PREFERENCES_KEY_ANONYMOUS_UID

        if (preferences.object(forKey: anonymousUidKey) != nil) {
            self.anonymousUid = preferences.string(forKey: anonymousUidKey) ?? nil
        } else {
            self.anonymousUid = UUID().uuidString
            preferences.set(self.anonymousUid, forKey: anonymousUidKey)
        }
    }
    
    private func makeHttpRequest<T: Encodable>(
        uri: String, _ request: T, _ onSuccess: @escaping (Data?) -> Void, _ onError: @escaping (Error) -> Void
    ) {
        let headers: HTTPHeaders = [
            "X-Public-Key": publicKey ?? ""
        ]
        
        AF.request("\(baseUri)/\(uri)", method: .post, parameters: request, encoder: JSONParameterEncoder.default, headers: headers).validate().responseJSON { response in switch response.result {
                    case .success:
                        onSuccess(response.data)
                    case let .failure(error):
                        onError(error)
            }
        }
    }
    
    func identify(uid: String?, options: NSDictionary?) throws {
        if (uid != nil) {
            self.uid = uid
            return
        }
        
        if (options == nil) {
            throw DashXClientError.noArgsInIdentify
        }
        
        let optionsDictionary = options as? Dictionary<String, String>
        
        let identifyRequest = IdentifyRequest(
            first_name: optionsDictionary?["firstName"],
            last_name: optionsDictionary?["lastName"],
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            anonymous_uid: self.anonymousUid
        )
        
        Logger.d(tag: #function, "Calling Identify with \(identifyRequest)")
        
        makeHttpRequest(
            uri: "identify",
            identifyRequest,
            { response in Logger.d(tag: #function, "Sent identify with \(String(describing: response))") },
            { error in Logger.d(tag: #function, "Encountered an error during identify(): \(error)") }
        )
    }
}
