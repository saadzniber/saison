import Foundation
import FirebaseFirestore

class FamilyService: FirebaseService, ObservableObject {

    func createFamily(name: String, adminId: String) async throws -> Family {
        let ref = db.collection("families").document()
        let code = String(UUID().uuidString.prefix(8)).uppercased()
        let family = Family(
            id: ref.documentID,
            name: name,
            memberIds: [adminId],
            inviteCode: code,
            createdAt: Date()
        )
        try await ref.setData(encodeFamily(family))
        try await db.collection("users").document(adminId).updateData(["familyId": family.id])
        return family
    }

    func joinFamily(code: String, userId: String) async throws -> Family {
        let snapshot = try await db.collection("families")
            .whereField("inviteCode", isEqualTo: code.uppercased())
            .limit(to: 1)
            .getDocuments()

        guard let doc = snapshot.documents.first else {
            throw NSError(domain: "FamilyService", code: 404, userInfo: [NSLocalizedDescriptionKey: NSLocalizedString("error_invalid_code", comment: "")])
        }

        let familyId = doc.documentID
        try await db.collection("families").document(familyId).updateData([
            "memberIds": FieldValue.arrayUnion([userId])
        ])
        try await db.collection("users").document(userId).updateData(["familyId": familyId])

        var data = doc.data()
        var memberIds = data["memberIds"] as? [String] ?? []
        if !memberIds.contains(userId) { memberIds.append(userId) }
        data["memberIds"] = memberIds
        return decodeFamily(id: familyId, data: data)
    }

    func getUserFamily(uid: String) async throws -> Family? {
        let userDoc = try await db.collection("users").document(uid).getDocument()
        guard let familyId = userDoc.data()?["familyId"] as? String else { return nil }
        let familyDoc = try await db.collection("families").document(familyId).getDocument()
        guard let data = familyDoc.data() else { return nil }
        return decodeFamily(id: familyId, data: data)
    }

    func getFamilyMembers(familyId: String) async throws -> [AppUser] {
        let familyDoc = try await db.collection("families").document(familyId).getDocument()
        guard let memberIds = familyDoc.data()?["memberIds"] as? [String] else { return [] }

        var members: [AppUser] = []
        for uid in memberIds {
            let doc = try await db.collection("users").document(uid).getDocument()
            if let data = doc.data() {
                let member = AppUser(
                    id: uid,
                    displayName: data["displayName"] as? String ?? "",
                    email: data["email"] as? String ?? "",
                    photoURL: data["photoURL"] as? String
                )
                members.append(member)
            }
        }
        return members
    }

    func generateInviteCode(familyId: String) async throws -> String {
        let code = String(UUID().uuidString.prefix(8)).uppercased()
        try await db.collection("families").document(familyId).updateData(["inviteCode": code])
        return code
    }

    func leaveFamily(userId: String, familyId: String) async throws {
        try await db.collection("families").document(familyId).updateData([
            "memberIds": FieldValue.arrayRemove([userId])
        ])
        try await db.collection("users").document(userId).updateData(["familyId": FieldValue.delete()])
    }

    // MARK: - Encode / Decode

    private func encodeFamily(_ f: Family) -> [String: Any] {
        [
            "name": f.name,
            "memberIds": f.memberIds,
            "inviteCode": f.inviteCode,
            "createdAt": Timestamp(date: f.createdAt)
        ]
    }

    private func decodeFamily(id: String, data: [String: Any]) -> Family {
        Family(
            id: id,
            name: data["name"] as? String ?? "",
            memberIds: data["memberIds"] as? [String] ?? [],
            inviteCode: data["inviteCode"] as? String ?? "",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }
}

// Lightweight user struct for member listing
struct AppUser: Identifiable {
    let id: String
    let displayName: String
    let email: String
    let photoURL: String?
}
