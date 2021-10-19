import Foundation
import Apollo

struct FirebaseRemoteMessage: Decodable {
    let aps: APS

    struct APS: Decodable {
        let alert: Alert

        struct Alert: Decodable {
            let title: String
            let body: String
        }
    }

    init(decoding userInfo: [AnyHashable: Any]) throws {
        let data = try JSONSerialization.data(withJSONObject: userInfo, options: .prettyPrinted)
        self = try JSONDecoder().decode(FirebaseRemoteMessage.self, from: data)
    }
}

public extension DashXGql {
    typealias JSON = [String : Any?]
    typealias Json = [String : Any?]
    typealias UUID = String
}

extension Dictionary: JSONDecodable {
  public init(jsonValue value: JSONValue) throws {
    guard let dictionary = value as? Dictionary else {
      throw JSONDecodingError.couldNotConvert(value: value, to: Dictionary.self)
    }
    self = dictionary
  }
}

