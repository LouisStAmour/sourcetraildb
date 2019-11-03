#include <napi.h>
#include "Writer.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    return Writer::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
