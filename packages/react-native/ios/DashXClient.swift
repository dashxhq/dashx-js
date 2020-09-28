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

        let headerDictionary = withHeaders.merging(
            [ "X-Public-Key": publicKey ?? "" ]
        ) { (current, _) in current }

        let headers = HTTPHeaders.init(headerDictionary)
        
        let jsonEncoder = JSONEncoder()
        jsonEncoder.keyEncodingStrategy = .convertToSnakeCase

        // For debugging
        if let jsonData = try? jsonEncoder.encode(request),
        let jsonString = String(data: jsonData, encoding: .utf8) {
            DashXLog.d(tag: #function, jsonString)
        }

        AF.request(baseUri + uri, method: .post, parameters: request, encoder: JSONParameterEncoder(encoder: jsonEncoder), headers: headers).validate().responseJSON { response in switch response.result {
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
            firstName: optionsDictionary?["firstName"],
            lastName: optionsDictionary?["lastName"],
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            anonymousUid: self.anonymousUid
        )

        DashXLog.d(tag: #function, "Calling Identify with \(identifyRequest)")

        makeHttpRequest(uri: "/identify", identifyRequest,
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

        let trackRequest = TrackRequest(event: event, anonymousUid: self.anonymousUid, uid: self.uid, data: trackData)

        DashXLog.d(tag: #function, "Calling track with \(trackRequest)")

        makeHttpRequest(uri: "/track", trackRequest,
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
            value: deviceToken!, kind:deviceKind, anonymousUid: anonymousUid, uid: uid
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(subscribeRequest)")

        let headers = [ "X-Identity-Token": identityToken! ]

        makeHttpRequest(uri: "/subscribe", subscribeRequest, withHeaders: headers,
            { response in DashXLog.d(tag: #function, "Subscribed with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during subscribe(): \(error)") }
        )
    }
    
    func screen(_ screenName: String, withData: NSDictionary?) {
        let properties = withData as? Dictionary<String, Any>
        
       track(Constants.INTERNAL_EVENT_APP_SCREEN_VIEWED, withData: properties?.merging([ "name": screenName], uniquingKeysWith: { (_, new) in new }) as NSDictionary?)
    }
    
    func content(_ contentType: String, withOptions: NSDictionary) {
        var filterByVal: JSONValue?
        var orderByVal: JSONValue?
        
        let optionsDictionary = withOptions as! Dictionary<String, Any>
        
        if let filterBy = optionsDictionary["filter"], JSONSerialization.isValidJSONObject(filterBy) {
            filterByVal = try? JSONDecoder().decode(JSONValue.self, from: JSONSerialization.data(withJSONObject: filterBy))
        }
        
        if let orderBy = optionsDictionary["order"], JSONSerialization.isValidJSONObject(orderBy) {
            orderByVal = try? JSONDecoder().decode(JSONValue.self, from: JSONSerialization.data(withJSONObject: orderBy))
        }
        
        let contentRequest = ContentRequest(
            contentType: contentType,
            returnType: optionsDictionary["returnType"] as? String,
            limit: optionsDictionary["limit"] as? Int,
            page: optionsDictionary["page"] as? Int,
            filter: filterByVal,
            order: orderByVal
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(contentRequest)")

        makeHttpRequest(uri: "/content", contentRequest,
            { response in DashXLog.d(tag: #function, "Called content with \(String(describing: response))") },
            { error in DashXLog.d(tag: #function, "Encountered an error during content(): \(error)") }
        )
    }
}
