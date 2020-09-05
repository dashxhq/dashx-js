import Foundation

struct IdentifyRequest: Encodable {
    let first_name, last_name, email, phone, anonymous_uid: String?
}

struct TrackRequest: Encodable {
    let event: String
    let anonymous_uid, uid: String?
    let data: Data?
}
