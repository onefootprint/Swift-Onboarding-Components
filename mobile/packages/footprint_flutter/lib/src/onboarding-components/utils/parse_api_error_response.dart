import 'dart:convert';

typedef ApiErrorData = ({
  String message,
  String? supportId,
  Map<String, String>? context,
});

// Function to extract error details from the API response
ApiErrorData parseApiErrorResponse(String jsonResponse) {
  try {
    // Parse the JSON response into a Map
    final Map<String, dynamic> jsonMap = jsonDecode(jsonResponse);

    // Extract the message (required)
    final String message = jsonMap['message'] ?? 'Unknown error';

    // Extract supportId (nullable)
    final String? supportId = jsonMap['support_id'];

    // Extract context (nullable) and convert to Map<String, String>
    final Map<String, String>? context =
        (jsonMap['context'] as Map<String, dynamic>?)
            ?.map((key, value) => MapEntry(key, value.toString()));

    // Return a Map containing the extracted values
    return (
      message: message,
      supportId: supportId,
      context: context,
    );
  } catch (e) {
    return (
      message: 'Unknown error',
      supportId: null,
      context: null,
    );
  }
}
