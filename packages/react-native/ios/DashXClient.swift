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

    private func generateAnonymousUid(withRegenerate: Bool = false) {
        let preferences = UserDefaults.standard
        let anonymousUidKey = Constants.USER_PREFERENCES_KEY_ANONYMOUS_UID

        if !withRegenerate && preferences.object(forKey: anonymousUidKey) != nil {
            self.anonymousUid = preferences.string(forKey: anonymousUidKey) ?? nil
        } else {
            self.anonymousUid = UUID().uuidString
            preferences.set(self.anonymousUid, forKey: anonymousUidKey)
        }
    }
    
    private func makeHttpRequest<T: Encodable>(
        uri: String, _ request: T, _ onSuccess: @escaping (Data?) -> Void, _ onError: @escaping (Error) -> Void
    ) {
        if publicKey == nil {
            DashXLog.d(tag: #function, "Public key not set. Aborting.")
            return
        }
        
        let headers: HTTPHeaders = [
            "X-Public-Key": publicKey!
        ]
        
        // For debugging
        if let jsonData = try? JSONEncoder().encode(request),
        let jsonString = String(data: jsonData, encoding: .utf8) {
            DashXLog.d(tag: #function, jsonString)
        }

        AF.request("\(baseUri)/\(uri)", method: .post, parameters: request, encoder: JSONParameterEncoder.default, headers: headers).validate().responseJSON { response in switch response.result {
                    case .success:
                        onSuccess(response.data)
                    case let .failure(error):
                        onError(error)
            }
        }
    }
    
    func identify(_ uid: String?, withOptions: NSDictionary?) throws {
        if uid != nil {
            self.uid = uid
            return
        }
        
        if withOptions == nil {
            throw DashXClientError.noArgsInIdentify
        }
        
        let optionsDictionary = withOptions as? Dictionary<String, String>
        
        let identifyRequest = IdentifyRequest(
            first_name: optionsDictionary?["firstName"],
            last_name: optionsDictionary?["lastName"],
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            anonymous_uid: self.anonymousUid
        )
        
        DashXLog.d(tag: #function, "Calling Identify with \(identifyRequest)")
        
        makeHttpRequest(uri: "identify", identifyRequest,
            { response in DashXLog.d(tag: #function, "Sent identify with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during identify(): \(error)") }
        )
    }
    
    func reset() {
        self.uid = nil
        self.generateAnonymousUid(withRegenerate: true)
    }
    
    func track(_ event: String, withData: NSDictionary?) {
        let trackData: JSONValue?
        
        if withData == nil {
            trackData = nil
        } else if JSONSerialization.isValidJSONObject(withData!) {
            trackData = try? JSONDecoder().decode(JSONValue.self, from: JSONSerialization.data(withJSONObject: withData!))
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding track data")
            return
        }
        
        let trackRequest = TrackRequest(event: event, anonymous_uid: self.anonymousUid, uid: self.uid, data: trackData)

        DashXLog.d(tag: #function, "Calling track with \(trackRequest)")
        
        makeHttpRequest(uri: "track", trackRequest,
            { response in DashXLog.d(tag: #function, "Sent track with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during track(): \(error)") }
        )
    }
}
