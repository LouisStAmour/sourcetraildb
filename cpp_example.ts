import {
  Writer,
  SourceRange,
  NameHierarchy,
  NameElement,
  DefinitionKind,
  ReferenceKind,
  SymbolKind,
  FileId,
  LocalSymbolId,
  ReferenceId,
  SymbolId
} from "./index";
import { exists } from "fs";

const dbWriter = new Writer();

console.log("SourcetrailDB C++ API Example");
console.log("");
console.log("SourcetrailDB version: ", dbWriter.getVersionString());
console.log(
  "Supported database version: ",
  dbWriter.getSupportedDatabaseVersion()
);
console.log("");

if (process.argv.length < 4 || process.argv.length > 5) {
  console.log(
    "usage: cpp_api_example <database_path> <source_path> <optional:database_version>"
  );
  process.exit(0);
}

const dbPath = process.argv[2];
const sourcePath = process.argv[3].replace("\\", "/");
let dbVersion;
if (process.argv.length === 5) {
  dbVersion = parseInt(process.argv[4]);
}
if (dbVersion && dbVersion !== dbWriter.getSupportedDatabaseVersion()) {
  console.error(
    "error: binary only supports database version: ",
    dbWriter.getSupportedDatabaseVersion(),
    ". Requested version: ",
    dbVersion
  );
  process.exit(1);
}

const safely = (
  returnValue: boolean | FileId | LocalSymbolId | ReferenceId | SymbolId
) => {
  if (returnValue === false || returnValue === 0) {
    console.error("error: ", dbWriter.getLastError());
    console.trace();
    process.exit(1);
  }
  return returnValue;
};

// open database by passing .srctrldb or .srctrldb_tmp path
console.log("Opening Database: ", dbPath);
safely(dbWriter.open(dbPath));

console.log("Clearing Database... ");
safely(dbWriter.clear());

console.log("Starting Indexing...");

// start recording with faster speed
safely(dbWriter.beginTransaction());

// record source file by passing it's absolute path
const fileId = safely(dbWriter.recordFile(sourcePath)) as FileId;
safely(dbWriter.recordFileLanguage(fileId, "cpp")); // record file language for syntax highlighting

// record atomic source range for multi line comment
safely(dbWriter.recordAtomicSourceRange(new SourceRange(fileId, 2, 1, 6, 3)));

// record namespace "api"
const namespaceName = new NameHierarchy(".", [new NameElement("api")]);
const namespaceId = safely(dbWriter.recordSymbol(namespaceName)) as SymbolId;
safely(
  dbWriter.recordSymbolDefinitionKind(namespaceId, DefinitionKind.EXPLICIT)
);
safely(dbWriter.recordSymbolKind(namespaceId, SymbolKind.NAMESPACE));
safely(
  dbWriter.recordSymbolLocation(
    namespaceId,
    new SourceRange(fileId, 8, 11, 8, 13)
  )
);
safely(
  dbWriter.recordSymbolScopeLocation(
    namespaceId,
    new SourceRange(fileId, 8, 1, 24, 1)
  )
);

// record class "MyType"
const className = namespaceName;
className.nameElements.push(new NameElement("MyType"));
const classId = safely(dbWriter.recordSymbol(className)) as SymbolId;
safely(dbWriter.recordSymbolDefinitionKind(classId, DefinitionKind.EXPLICIT));
safely(dbWriter.recordSymbolKind(classId, SymbolKind.CLASS));
safely(
  dbWriter.recordSymbolLocation(classId, new SourceRange(fileId, 11, 7, 11, 12))
);
safely(
  dbWriter.recordSymbolScopeLocation(
    classId,
    new SourceRange(fileId, 11, 1, 22, 1)
  )
); // gets highlight when active

// record inheritance reference to "BaseType"
const baseId = safely(
  dbWriter.recordSymbol(new NameHierarchy(".", [new NameElement("BaseType")]))
) as SymbolId;
const inheritanceId = safely(
  dbWriter.recordReference(classId, baseId, ReferenceKind.INHERITANCE)
) as ReferenceId;
safely(
  dbWriter.recordReferenceLocation(
    inheritanceId,
    new SourceRange(fileId, 12, 14, 12, 21)
  )
);

// add child method "void my_method() const"
const methodName = className;
methodName.nameElements.push(new NameElement("void", "my_method", "() const"));
const methodId = safely(dbWriter.recordSymbol(methodName)) as SymbolId;
safely(dbWriter.recordSymbolDefinitionKind(methodId, DefinitionKind.EXPLICIT));
safely(dbWriter.recordSymbolKind(methodId, SymbolKind.METHOD));
safely(
  dbWriter.recordSymbolLocation(
    methodId,
    new SourceRange(fileId, 15, 10, 15, 18)
  )
);
safely(
  dbWriter.recordSymbolScopeLocation(
    methodId,
    new SourceRange(fileId, 15, 5, 21, 5)
  )
); // gets highlight when active
safely(
  dbWriter.recordSymbolSignatureLocation(
    methodId,
    new SourceRange(fileId, 15, 5, 15, 45)
  )
); // used in tooltip

// record usage of parameter type "bool"
const typeId = safely(
  dbWriter.recordSymbol(
    new NameHierarchy(".", [new NameElement("", "bool", "")])
  )
) as SymbolId;
const typeuseId = safely(
  dbWriter.recordReference(methodId, typeId, ReferenceKind.TYPE_USAGE)
) as ReferenceId;
safely(
  dbWriter.recordReferenceLocation(
    typeuseId,
    new SourceRange(fileId, 15, 20, 15, 23)
  )
);

// record parameter "do_send_signal"
const localId = safely(
  dbWriter.recordLocalSymbol("do_send_signal")
) as SymbolId;
safely(
  dbWriter.recordLocalSymbolLocation(
    localId,
    new SourceRange(fileId, 15, 25, 15, 38)
  )
);
safely(
  dbWriter.recordLocalSymbolLocation(
    localId,
    new SourceRange(fileId, 17, 13, 17, 26)
  )
);

// record source range of "Client" as qualifier location
const qualifierId = safely(
  dbWriter.recordSymbol(new NameHierarchy(".", [new NameElement("Client")]))
) as SymbolId;
safely(
  dbWriter.recordQualifierLocation(
    qualifierId,
    new SourceRange(fileId, 19, 13, 19, 18)
  )
);

// record function call reference to "send_signal()"
const funcId = safely(
  dbWriter.recordSymbol(
    new NameHierarchy(".", [
      new NameElement("Client"),
      new NameElement("", "send_signal", "()")
    ])
  )
) as SymbolId;
safely(dbWriter.recordSymbolKind(funcId, SymbolKind.FUNCTION));
const callId = safely(
  dbWriter.recordReference(methodId, funcId, ReferenceKind.CALL)
) as ReferenceId;
safely(
  dbWriter.recordReferenceLocation(
    callId,
    new SourceRange(fileId, 19, 21, 19, 31)
  )
);

// record error
safely(
  dbWriter.recordError(
    'Really? You missed that ";" again? (intentional error)',
    false,
    new SourceRange(fileId, 22, 1, 22, 1)
  )
);

// end recording
safely(dbWriter.commitTransaction());

// check for errors before finishing
if (dbWriter.getLastError()) {
  console.error("error: ", dbWriter.getLastError());
  process.exit(1);
}

console.log("done!");
