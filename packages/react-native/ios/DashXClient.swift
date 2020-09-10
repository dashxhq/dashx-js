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
    private var deviceToken: String?
    private var identityToken: String?
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
    
    func setDeviceToken(to: String) {
        self.deviceToken = to
    }
    
    func setIdentityToken(to: String) {
        self.identityToken = to
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
        uri: String,
        _ request: T,
        withHeaders: Dictionary<String, String> = [:],
        _ onSuccess: @escaping (Data?) -> Void,
        _ onError: @escaping (Error) -> Void
    ) {
        
        let headerDictionary = extraHeaders.merging(
            [ "X-Public-Key": publicKey ?? "" ]
        ) { (current, _) in current }
        
        let headers = HTTPHeaders.init(headerDictionary)
        
        func customDataEncoder(data: Data, encoder: Encoder) throws {
            let jsonObject = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? Dictionary<String, String>
            var container = encoder.singleValueContainer()
            try container.encode(jsonObject)
        }
        
        let jsonEncoder = JSONEncoder()
        jsonEncoder.dataEncodingStrategy = .custom(customDataEncoder)
        
        AF.request("\(baseUri)/\(uri)", method: .post, parameters: request, encoder: JSONParameterEncoder(encoder: jsonEncoder), headers: headers).validate().responseJSON { response in switch response.result {
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
        let trackRequest: TrackRequest
        
        if let trackData = try? JSONSerialization.data(withJSONObject: withData ?? []) {
            trackRequest = TrackRequest(event: event, anonymous_uid: self.anonymousUid, uid: self.uid, data: trackData)
        } else {
            DashXLog.d(tag: #function, "Encountered an error while encoding track data")
            return
        }
        
        DashXLog.d(tag: #function, "Calling track with \(trackRequest)")
        
        makeHttpRequest(uri: "track", trackRequest,
            { response in DashXLog.d(tag: #function, "Sent track with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during track(): \(error)") }
        )
    }
    
    func subscribe() {
        if deviceToken == nil || identityToken == nil {
            return
        }
        
        let deviceKind = "IOS"
        let subscribeRequest = SubscribeRequest(
            value: deviceToken!, kind:deviceKind, anonymous_uid: anonymousUid, uid: uid
        )
        
        DashXLog.d(tag: #function, "Calling subscribe with \(subscribeRequest)")
        
        let headers = [ "X-Identity-Token": identityToken! ]
        
        makeHttpRequest(uri: "subscribe", subscribeRequest, withHeaders: headers,
            { response in DashXLog.d(tag: #function, "Subscribed with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during subscribe(): \(error)") }
        )
    }
}
