import SwiftUI

public struct FootprintPackage {

    public init() {}

    public func showAlert(from view: UIView) {
        let alert = UIAlertController(title: "aAlert from Package", message: "This is an alert from the separate package.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        if let controller = view.window?.rootViewController {
            controller.present(alert, animated: true, completion: nil)
        }
    }
}
