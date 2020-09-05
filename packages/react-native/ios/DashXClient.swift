import Foundation

class DashXClient {
    private var anonymousUid
    
    func generateAnonymousUid() {
        let preferences = UserDefaults.standard
        let anonymousUidKey = "DashX.anonymousUid"
        
        if (preferences.object(forKey: anonymousUidKey) != nil) {
            self.anonymousUid = preferences.integer(forKey: anonymousUidKey)
        } else {
            self.anonymousUid = UUID().uuidString
            preferences.set(self.anonymousUid, forKey: anonymousUidKey)
        }
    }
}
