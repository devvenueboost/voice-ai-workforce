"use strict";
// packages/types/src/types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.HTTPMethod = exports.ActionType = exports.ResponseMode = exports.AIProvider = exports.SpeechProvider = void 0;
// Enums
var SpeechProvider;
(function (SpeechProvider) {
    SpeechProvider["WEB_SPEECH"] = "web-speech";
    SpeechProvider["AZURE"] = "azure";
    SpeechProvider["GOOGLE"] = "google";
    SpeechProvider["OPENAI"] = "openai";
})(SpeechProvider || (exports.SpeechProvider = SpeechProvider = {}));
var AIProvider;
(function (AIProvider) {
    AIProvider["OPENAI"] = "openai";
    AIProvider["ANTHROPIC"] = "anthropic";
    AIProvider["AZURE"] = "azure";
})(AIProvider || (exports.AIProvider = AIProvider = {}));
var ResponseMode;
(function (ResponseMode) {
    ResponseMode["VOICE"] = "voice";
    ResponseMode["TEXT"] = "text";
    ResponseMode["BOTH"] = "both";
})(ResponseMode || (exports.ResponseMode = ResponseMode = {}));
var ActionType;
(function (ActionType) {
    ActionType["API_CALL"] = "api_call";
    ActionType["NOTIFICATION"] = "notification";
    ActionType["NAVIGATION"] = "navigation";
    ActionType["DATA_UPDATE"] = "data_update";
})(ActionType || (exports.ActionType = ActionType = {}));
var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["GET"] = "GET";
    HTTPMethod["POST"] = "POST";
    HTTPMethod["PUT"] = "PUT";
    HTTPMethod["DELETE"] = "DELETE";
})(HTTPMethod || (exports.HTTPMethod = HTTPMethod = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["FIELD_WORKER"] = "field_worker";
    UserRole["CLIENT"] = "client";
})(UserRole || (exports.UserRole = UserRole = {}));
