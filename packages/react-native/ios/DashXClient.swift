import Foundation
import Apollo

enum DashXClientError: Error {
    case noArgsInIdentify
}

class DashXClient {
    static let instance = DashXClient()
    private var anonymousUid: String?
    private var uid: String?
    private var deviceToken: String?
    private var accountType: String?

    private init() {
        generateAnonymousUid()
    }

    func setDeviceToken(to: String) {
        self.deviceToken = to
    }

    func setAccountType(to: String) {
        self.accountType = to
    }

    func setTargetEnvironment(to: String) {
        ConfigInterceptor.shared.targetEnvironment = to
    }

    func setTargetInstallation(to: String) {
        ConfigInterceptor.shared.targetInstallation = to
    }

    func setIdentityToken(to: String) {
        ConfigInterceptor.shared.identityToken = to
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
    // MARK: -- identify

    func identify(_ uid: String?, withOptions: NSDictionary?) throws {
        if uid != nil {
            self.uid = uid
            return
        }

        if withOptions == nil {
            throw DashXClientError.noArgsInIdentify
        }

        let optionsDictionary = withOptions as? [String: String]

        let identifyAccountInput = DashXGql.IdentifyAccountInput(
            accountType: accountType,
            uid: uid,
            anonymousUid: anonymousUid,
            email: optionsDictionary?["email"],
            phone: optionsDictionary?["phone"],
            name: optionsDictionary?["name"],
            firstName: optionsDictionary?["firstName"],
            lastName: optionsDictionary?["lastName"]
        )

        let identifyAccountMutation = DashXGql.IdentifyAccountMutation(input: identifyAccountInput)

        Network.shared.apollo.perform(mutation: identifyAccountMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent identify with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during identify(): \(error)")
          }
        }
    }

    func reset() {
        self.uid = nil
        self.generateAnonymousUid(withRegenerate: true)
    }
    // MARK: -- track

    func track(_ event: String, withData: NSDictionary?) {
        if accountType == nil {
            DashXLog.d(tag: #function, "AccountType not set skipping track()")
            return
        }

        let trackEventInput = DashXGql.TrackEventInput(
            accountType: accountType!,
            event: event,
            accountUid: uid,
            accountAnonymousUid: anonymousUid,
            data: withData as? [String: Any?]
        )

        DashXLog.d(tag: #function, "Calling track with \(trackEventInput)")

        let trackEventMutation = DashXGql.TrackEventMutation(input: trackEventInput)

        Network.shared.apollo.perform(mutation: trackEventMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent track with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during track(): \(error)")
          }
        }
    }

    func screen(_ screenName: String, withData: NSDictionary?) {
        let properties = withData as? [String: Any]

        track(Constants.INTERNAL_EVENT_APP_SCREEN_VIEWED, withData: properties?.merging([ "name": screenName], uniquingKeysWith: { (_, new) in new }) as NSDictionary?)
    }
    // MARK: -- subscribe

    func subscribe() {
        if deviceToken == nil || ConfigInterceptor.shared.identityToken == nil {
            return
        }

        let deviceKind = "IOS"

        let subscribeContactInput  = DashXGql.SubscribeContactInput(
            uid: uid!,
            name: deviceKind,
            kind: .ios,
            value: deviceToken!
        )

        DashXLog.d(tag: #function, "Calling subscribe with \(subscribeContactInput)")

        let subscribeContactMutation = DashXGql.SubscribeContactMutation(input: subscribeContactInput)

        Network.shared.apollo.perform(mutation: subscribeContactMutation) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent subscribe with \(String(describing: graphQLResult))")
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during subscribe(): \(error)")
          }
        }
    }
    // MARK: -- content

    func fetchContent(
        _ contentType: String,
        _ content: String,
        _ preview: Bool? = true,
        _ language: String?,
        _ fields: [String]? = [],
        _ include: [String]? = [],
        _ exclude: [String]? = [],
        _ resolve: @escaping RCTPromiseResolveBlock,
        _ reject: @escaping RCTPromiseRejectBlock
    ) {
        let fetchContentInput  = DashXGql.FetchContentInput(
            contentType: contentType,
            content: content,
            preview: preview,
            language: language,
            fields: fields,
            include: include,
            exclude: exclude
        )

        DashXLog.d(tag: #function, "Calling fetchContent with \(fetchContentInput)")

        let findContentQuery = DashXGql.FetchContentQuery(input: fetchContentInput)

        Network.shared.apollo.fetch(query: findContentQuery, cachePolicy: .returnCacheDataElseFetch) { result in
          switch result {
          case .success(let graphQLResult):
            DashXLog.d(tag: #function, "Sent findContent with \(String(describing: graphQLResult))")
            let content = graphQLResult.data?.fetchContent
            resolve(content)
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during fetchContent(): \(error)")
            reject("", error.localizedDescription, error)
          }
        }
    }

    func searchContent(
        _ contentType: String,
        _ returnType: String,
        _ filter: NSDictionary?,
        _ order: NSDictionary?,
        _ limit: Int?,
        _ preview: Bool? = true,
        _ language: String?,
        _ fields: [String]? = [],
        _ include: [String]? = [],
        _ exclude: [String]? = [],
        _ resolve: @escaping RCTPromiseResolveBlock,
        _ reject: @escaping RCTPromiseRejectBlock
    ) {
        let searchContentsInput  = DashXGql.SearchContentInput(
            contentType: contentType,
            returnType: returnType,
            filter: filter as? [String: Any],
            order: order as? [String: Any],
            limit: limit,
            preview: preview,
            language: language,
            fields: fields,
            include: include,
            exclude: exclude
        )

        DashXLog.d(tag: #function, "Calling searchContent with \(searchContentsInput)")

        let searchContentQuery = DashXGql.SearchContentQuery(input: searchContentsInput)

        Network.shared.apollo.fetch(query: searchContentQuery, cachePolicy: .returnCacheDataElseFetch) { result in
          switch result {
          case .success(let graphQLResult):
            let json = graphQLResult.data?.searchContent
            DashXLog.d(tag: #function, "Sent searchContents with \(String(describing: json))")
            resolve(json)
          case .failure(let error):
            DashXLog.d(tag: #function, "Encountered an error during searchContent(): \(error)")
            reject("", error.localizedDescription, error)
          }
        }
    }
}
