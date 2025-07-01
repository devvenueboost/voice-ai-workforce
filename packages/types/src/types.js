// packages/types/src/types.ts
// Enums
export var SpeechProvider;
(function (SpeechProvider) {
    SpeechProvider["WEB_SPEECH"] = "web-speech";
    SpeechProvider["AZURE"] = "azure";
    SpeechProvider["GOOGLE"] = "google";
    SpeechProvider["OPENAI"] = "openai";
})(SpeechProvider || (SpeechProvider = {}));
export var AIProvider;
(function (AIProvider) {
    AIProvider["OPENAI"] = "openai";
    AIProvider["ANTHROPIC"] = "anthropic";
    AIProvider["AZURE"] = "azure";
})(AIProvider || (AIProvider = {}));
export var ResponseMode;
(function (ResponseMode) {
    ResponseMode["VOICE"] = "voice";
    ResponseMode["TEXT"] = "text";
    ResponseMode["BOTH"] = "both";
})(ResponseMode || (ResponseMode = {}));
export var ActionType;
(function (ActionType) {
    ActionType["API_CALL"] = "api_call";
    ActionType["NOTIFICATION"] = "notification";
    ActionType["NAVIGATION"] = "navigation";
    ActionType["DATA_UPDATE"] = "data_update";
})(ActionType || (ActionType = {}));
export var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["POST"] = "POST";
    HTTPMethod["PUT"] = "PUT";
    HTTPMethod["DELETE"] = "DELETE";
    HTTPMethod["PATCH"] = "PATCH";
})(HTTPMethod || (HTTPMethod = {}));
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["FIELD_WORKER"] = "field_worker";
    UserRole["CLIENT"] = "client";
})(UserRole || (UserRole = {}));
