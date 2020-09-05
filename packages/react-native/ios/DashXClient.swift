import Foundation

struct DashXClient {
    static let instance = DashXClient()
    private var anonymousUid

    private init() { }

    private func generateAnonymousUid() {
        let preferences = UserDefaults.standard
        let anonymousUidKey = "DashX.anonymousUid"

        if (preferences.object(forKey: anonymousUidKey) != nil) {
            self.anonymousUid = preferences.string(forKey: anonymousUidKey)
        } else {
            self.anonymousUid = UUID().uuidString
            preferences.set(self.anonymousUid, forKey: anonymousUidKey)
        }
    }
}
