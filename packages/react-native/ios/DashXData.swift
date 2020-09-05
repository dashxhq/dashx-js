import Foundation

struct IdentifyRequest: Encodable {
    let first_name, last_name, email, phone, anonymous_uid: String?
}

struct TrackRequest<T: Encodable>: Encodable {
    let event: String
    let data: Dictionary<String, T>
}
