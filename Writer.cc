#include <napi.h>

#include <cstdlib>
#include <fstream>
#include <iostream>

#include <SourcetrailDBWriter.h>
/*
PUBLIC symbols used in SourcetrailDBWriter.h:
 - DefinitionKind - enum IMPLICIT = 1, EXPLICIT = 2
 - NameHierarchy - struct to store a delimeter between name elements, and a vector of structs each with name, and optional prefix/postfix
 - ReferenceKind - Enum providing all possible values for kinds of references that can be recorded using the SourcetrailDBWriter interface
 - SourceRange - Struct that represents the location of a range of characters in a source file. (Line & Column counts start at 1, start & end inclusive)
 - SymbolKind - Enum providing all possible values for kinds of symbols that can be recorded using the SourcetrailDBWriter interface

 Exceptions are always caught, hence why methods always return booleans. You can check the boolean to throw, or just pass the boolean on as an API quirk.
*/
// TODO: Implement the interface in index.ts
static Napi::String Method(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello, world!");
}

static Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "Writer"),
              Napi::Function::New(env, Method));
  return exports;
}

NODE_API_MODULE(Writer, Init)
