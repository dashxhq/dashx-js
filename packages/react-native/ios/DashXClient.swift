import Foundation

struct DashXClient {
    static let instance = DashXClient()
    private var anonymousUid

    private init() { }

    private func generateAnonymousUid() {
        let preferences = UserDefaults.standard
        let anonymousUidKey = Constants.USER_PREFERENCES_KEY_ANONYMOUS_UID

        if (preferences.object(forKey: anonymousUidKey) != nil) {
            self.anonymousUid = preferences.string(forKey: anonymousUidKey)
        } else {
            self.anonymousUid = UUID().uuidString
            preferences.set(self.anonymousUid, forKey: anonymousUidKey)
        }
    }
}
