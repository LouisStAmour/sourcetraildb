#ifndef Writer_H
#define Writer_H

#include <napi.h>
#include <SourcetrailDBWriter.h>

using namespace Napi;

class Writer : public ObjectWrap<Writer>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Writer(const CallbackInfo &info);

private:
    static FunctionReference constructor;

    Napi::Value getVersionString(const CallbackInfo &info);
    Napi::Value getSupportedDatabaseVersion(const CallbackInfo &info);
    Napi::Value getLastError(const CallbackInfo &info);
    void setLastError(const CallbackInfo &info);
    void clearLastError(const CallbackInfo &info);
    Napi::Value open(const CallbackInfo &info);
    Napi::Value close(const CallbackInfo &info);
    Napi::Value clear(const CallbackInfo &info);
    Napi::Value isEmpty(const CallbackInfo &info);
    Napi::Value isCompatible(const CallbackInfo &info);
    Napi::Value getLoadedDatabaseVersion(const CallbackInfo &info);
    Napi::Value beginTransaction(const CallbackInfo &info);
    Napi::Value commitTransaction(const CallbackInfo &info);
    Napi::Value rollbackTransaction(const CallbackInfo &info);
    Napi::Value optimizeDatabaseMemory(const CallbackInfo &info);
    Napi::Value recordSymbol(const CallbackInfo &info);
    Napi::Value recordSymbolDefinitionKind(const CallbackInfo &info);
    Napi::Value recordSymbolKind(const CallbackInfo &info);
    Napi::Value recordSymbolLocation(const CallbackInfo &info);
    Napi::Value recordSymbolScopeLocation(const CallbackInfo &info);
    Napi::Value recordSymbolSignatureLocation(const CallbackInfo &info);
    Napi::Value recordReference(const CallbackInfo &info);
    Napi::Value recordReferenceLocation(const CallbackInfo &info);
    Napi::Value recordReferenceIsAmbiguous(const CallbackInfo &info);
    Napi::Value recordReferenceToUnsolvedSymhol(const CallbackInfo &info);
    Napi::Value recordQualifierLocation(const CallbackInfo &info);
    Napi::Value recordFile(const CallbackInfo &info);
    Napi::Value recordFileLanguage(const CallbackInfo &info);
    Napi::Value recordLocalSymbol(const CallbackInfo &info);
    Napi::Value recordLocalSymbolLocation(const CallbackInfo &info);
    Napi::Value recordAtomicSourceRange(const CallbackInfo &info);
    Napi::Value recordError(const CallbackInfo &info);

    sourcetrail::SourcetrailDBWriter writer;

    std::pair<bool, const sourcetrail::SourceRange> Writer::toSourceRange(Napi::Value value);
};

#endif
