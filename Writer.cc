#include <napi.h>

#include <vector>

#include <SourcetrailDBWriter.h>
#include <NameHierarchy.h>
#include <DefinitionKind.h>
#include <SourceRange.h>
#include <SymbolKind.h>
#include <ReferenceKind.h>

#include "Writer.h"

using namespace Napi;

FunctionReference Writer::constructor;

Napi::Object Writer::Init(Napi::Env env, Napi::Object exports)
{
  // This method is used to hook the accessor and method callbacks
  Napi::Function func = DefineClass(env, "Writer", {
                                                       InstanceMethod("getVersionString", &Writer::getVersionString),
                                                       InstanceMethod("getSupportedDatabaseVersion", &Writer::getSupportedDatabaseVersion),
                                                       InstanceMethod("getLastError", &Writer::getLastError),
                                                       InstanceMethod("setLastError", &Writer::setLastError),
                                                       InstanceMethod("clearLastError", &Writer::clearLastError),
                                                       InstanceMethod("open", &Writer::open),
                                                       InstanceMethod("close", &Writer::close),
                                                       InstanceMethod("clear", &Writer::clear),
                                                       InstanceMethod("isEmpty", &Writer::isEmpty),
                                                       InstanceMethod("isCompatible", &Writer::isCompatible),
                                                       InstanceMethod("getLoadedDatabaseVersion", &Writer::getLoadedDatabaseVersion),
                                                       InstanceMethod("beginTransaction", &Writer::beginTransaction),
                                                       InstanceMethod("commitTransaction", &Writer::commitTransaction),
                                                       InstanceMethod("rollbackTransaction", &Writer::rollbackTransaction),
                                                       InstanceMethod("optimizeDatabaseMemory", &Writer::optimizeDatabaseMemory),
                                                       InstanceMethod("recordSymbol", &Writer::recordSymbol),
                                                       InstanceMethod("recordSymbolDefinitionKind", &Writer::recordSymbolDefinitionKind),
                                                       InstanceMethod("recordSymbolKind", &Writer::recordSymbolKind),
                                                       InstanceMethod("recordSymbolLocation", &Writer::recordSymbolLocation),
                                                       InstanceMethod("recordSymbolScopeLocation", &Writer::recordSymbolScopeLocation),
                                                       InstanceMethod("recordSymbolSignatureLocation", &Writer::recordSymbolSignatureLocation),
                                                       InstanceMethod("recordReference", &Writer::recordReference),
                                                       InstanceMethod("recordReferenceLocation", &Writer::recordReferenceLocation),
                                                       InstanceMethod("recordReferenceIsAmbiguous", &Writer::recordReferenceIsAmbiguous),
                                                       InstanceMethod("recordReferenceToUnsolvedSymhol", &Writer::recordReferenceToUnsolvedSymhol),
                                                       InstanceMethod("recordQualifierLocation", &Writer::recordQualifierLocation),
                                                       InstanceMethod("recordFile", &Writer::recordFile),
                                                       InstanceMethod("recordFileLanguage", &Writer::recordFileLanguage),
                                                       InstanceMethod("recordLocalSymbol", &Writer::recordLocalSymbol),
                                                       InstanceMethod("recordLocalSymbolLocation", &Writer::recordLocalSymbolLocation),
                                                       InstanceMethod("recordAtomicSourceRange", &Writer::recordAtomicSourceRange),
                                                       InstanceMethod("recordError", &Writer::recordError),
                                                       InstanceMethod("getVersionString", &Writer::getVersionString),
                                                   });

  // Create a peristent reference to the class constructor. This will allow
  // a function called on a class prototype and a function
  // called on instance of a class to be distinguished from each other.
  constructor = Napi::Persistent(func);
  // Call the SuppressDestruct() method on the static data prevent the calling
  // to this destructor to reset the reference when the environment is no longer
  // available.
  constructor.SuppressDestruct();
  exports.Set("Writer", func);
  return exports;
}

Writer::Writer(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Writer>(info)
{
  // Nothing to do, as the constructor doesn't take any arguments.
}

Napi::Value Writer::getVersionString(const Napi::CallbackInfo &info)
{
  return Napi::String::New(info.Env(), writer.getVersionString());
}

Napi::Value Writer::getSupportedDatabaseVersion(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), writer.getSupportedDatabaseVersion());
}

Napi::Value Writer::getLastError(const Napi::CallbackInfo &info)
{
  return Napi::String::New(info.Env(), writer.getLastError());
}

void Writer::setLastError(const CallbackInfo &info)
{
  if (info.Length() > 0)
  {
    writer.setLastError(info[0].ToString());
  }
}
void Writer::clearLastError(const CallbackInfo &info)
{
  writer.clearLastError();
}
Napi::Value Writer::open(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 1)
  {
    writer.setLastError("open() requires a databaseFilePath parameter");
    return Napi::Boolean::New(env, false);
  }
  bool result = writer.open(info[0].ToString());
  return Napi::Boolean::New(env, result);
}
Napi::Value Writer::close(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.close());
}
Napi::Value Writer::clear(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.clear());
}
Napi::Value Writer::isEmpty(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.isEmpty());
}
Napi::Value Writer::isCompatible(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.isCompatible());
}
Napi::Value Writer::getLoadedDatabaseVersion(const CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), writer.getLoadedDatabaseVersion());
}
Napi::Value Writer::beginTransaction(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.beginTransaction());
}
Napi::Value Writer::commitTransaction(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.commitTransaction());
}
Napi::Value Writer::rollbackTransaction(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.rollbackTransaction());
}
Napi::Value Writer::optimizeDatabaseMemory(const CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), writer.optimizeDatabaseMemory());
}
Napi::Value Writer::recordSymbol(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsObject())
  {
    writer.setLastError("recordSymbol() requires nameHierarchy object parameter");
    return Napi::Boolean::New(env, false);
  }
  Object nameHierarchy = info[0].As<Napi::Object>();
  Napi::Value nameDelimiter = nameHierarchy.Get("nameDelimiter");
  Napi::Value nameElements = nameHierarchy.Get("nameElements");
  if (!nameDelimiter.IsString() || !nameElements.IsArray())
  {
    writer.setLastError("expected well-formed nameHierarchy object");
    return Napi::Boolean::New(env, false);
  }
  Array ne = nameElements.As<Array>();
  std::vector<sourcetrail::NameElement> neVector;
  for (uint32_t i = 0; i < ne.Length(); i++)
  {
    Napi::Value nameElementVal = ne[i];
    if (!nameElementVal.IsObject())
    {
      writer.setLastError("expected packed NameElements array");
      return Napi::Boolean::New(env, false);
    }
    Object nameElement = nameElementVal.As<Object>();
    Napi::Value prefix = nameHierarchy.Get("prefix");
    Napi::Value name = nameHierarchy.Get("name");
    Napi::Value postfix = nameHierarchy.Get("postfix");
    if (!prefix.IsString() || !name.IsString() || !postfix.IsString())
    {
      writer.setLastError("expected NameElement object to be only strings");
      return Napi::Boolean::New(env, false);
    }
    neVector.push_back(sourcetrail::NameElement{prefix.As<String>(), name.As<String>(), postfix.As<String>()});
  }
  sourcetrail::NameHierarchy nh{
      nameDelimiter.As<String>(),
      neVector};
  bool result = writer.recordSymbol(nh);
  return Napi::Boolean::New(env, result);
}
Napi::Value Writer::recordSymbolDefinitionKind(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber())
  {
    writer.setLastError("recordSymbolDefinitionKind() requires two parameters, both numbers");
    return Napi::Boolean::New(env, false);
  }
  int definitionKindInt = info[1].As<Number>();
  bool result = writer.recordSymbolDefinitionKind(info[0].As<Number>(), definitionKindInt == static_cast<int>(sourcetrail::DefinitionKind::IMPLICIT) ? sourcetrail::DefinitionKind::IMPLICIT : sourcetrail::DefinitionKind::EXPLICIT);
  return Napi::Boolean::New(env, result);
}
std::pair<bool, const sourcetrail::SourceRange> Writer::toSourceRange(Napi::Value value)
{
  Object obj = value.As<Object>();
  Napi::Value fileId = obj.Get("fileId");
  Napi::Value startLine = obj.Get("startLine");
  Napi::Value startColumn = obj.Get("startColumn");
  Napi::Value endLine = obj.Get("endLine");
  Napi::Value endColumn = obj.Get("endColumn");
  if (!fileId.IsNumber() || !startLine.IsNumber() || !startColumn.IsNumber() || !endLine.IsNumber() || !endColumn.IsNumber())
  {
    writer.setLastError("SourceRange requires all fields to be numbers");
    sourcetrail::SourceRange sr;
    return std::pair<bool, const sourcetrail::SourceRange>{false, sr};
  }
  return std::pair<bool, const sourcetrail::SourceRange>{
      true,
      sourcetrail::SourceRange{fileId.As<Number>(), startLine.As<Number>(), startColumn.As<Number>(), endLine.As<Number>(), endColumn.As<Number>()}};
}
Napi::Value Writer::recordSymbolKind(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber())
  {
    writer.setLastError("recordSymbolKind() requires two parameters, both numbers");
    return Napi::Boolean::New(env, false);
  }
  int symbolKindInt = info[1].As<Number>();
  bool result = writer.recordSymbolKind(info[0].As<Number>(), static_cast<sourcetrail::SymbolKind>(symbolKindInt));
  return Napi::Boolean::New(env, result);
}
Napi::Value Writer::recordSymbolLocation(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsObject())
  {
    writer.setLastError("recordSymbolLocation() requires two parameters, the first a number, the second a SourceRange object");
    return Napi::Boolean::New(env, false);
  }
  std::pair<bool, const sourcetrail::SourceRange> sr = toSourceRange(info[1]);
  if (!sr.first)
  {
    return Napi::Boolean::New(env, false);
  }
  bool result = writer.recordSymbolLocation(info[0].As<Number>(), sr.second);
  return Napi::Boolean::New(env, result);
}
Napi::Value Writer::recordSymbolScopeLocation(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsObject())
  {
    writer.setLastError("recordSymbolScopeLocation() requires two parameters, the first a number, the second a SourceRange object");
    return Napi::Boolean::New(env, false);
  }
  std::pair<bool, const sourcetrail::SourceRange> sr = toSourceRange(info[1]);
  if (!sr.first)
  {
    return Napi::Boolean::New(env, false);
  }
  bool result = writer.recordSymbolScopeLocation(info[0].As<Number>(), sr.second);
  return Napi::Boolean::New(env, result);
}
Napi::Value Writer::recordSymbolSignatureLocation(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsObject())
  {
    writer.setLastError("recordSymbolSignatureLocation() requires two parameters, the first a number, the second a SourceRange object");
    return Napi::Boolean::New(env, false);
  }
  std::pair<bool, const sourcetrail::SourceRange> sr = toSourceRange(info[1]);
  if (!sr.first)
  {
    return Napi::Boolean::New(env, false);
  }
  bool result = writer.recordSymbolSignatureLocation(info[0].As<Number>(), sr.second);
  return Napi::Boolean::New(env, result);
}
Napi::Value Writer::recordReference(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordReferenceLocation(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordReferenceIsAmbiguous(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordReferenceToUnsolvedSymhol(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordQualifierLocation(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordFile(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordFileLanguage(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordLocalSymbol(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordLocalSymbolLocation(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordAtomicSourceRange(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
Napi::Value Writer::recordError(const CallbackInfo &info)
{
  Napi::Env env = info.Env();
  writer.setLastError("unimplemented");
  return Napi::Boolean::New(env, false);
}
