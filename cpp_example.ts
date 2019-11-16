import SourcetrailDB, { ReferenceKind, SymbolKind } from "./src/builder";

console.log("SourcetrailDB C++ API Example");
console.log("");
console.log("SourcetrailDB version: ", SourcetrailDB.getVersionString());
console.log(
  "Supported database version: ",
  SourcetrailDB.getSupportedDatabaseVersion()
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
if (dbVersion && dbVersion !== SourcetrailDB.getSupportedDatabaseVersion()) {
  console.error(
    "error: binary only supports database version: ",
    SourcetrailDB.getSupportedDatabaseVersion(),
    ". Requested version: ",
    dbVersion
  );
  process.exit(1);
}

// open database by passing .srctrldb or .srctrldb_tmp path
SourcetrailDB.openAndClear(dbPath, writer => {
  console.log("Starting Indexing...");
  // record source file by passing it's absolute path
  const file = writer.createFile(sourcePath).asLanguage("cpp"); // for syntax highlighting

  // record atomic source range for multi line comment
  writer.recordAtomicSourceRange(file.at(2, 1, 6, 3));

  // record namespace "api"
  const namespace = writer
    .createSymbol(".", "api")
    .explicitly()
    .ofType(SymbolKind.NAMESPACE)
    .atLocation(file.at(8, 11, 8, 13))
    .withScope(file.at(8, 1, 24, 1));

  // record class "MyType"
  const className = namespace
    .createChildSymbol("MyType")
    .explicitly()
    .ofType(SymbolKind.CLASS)
    .atLocation(file.at(11, 7, 11, 12))
    .withScope(file.at(11, 1, 22, 1)); // gets highlight when active

  // record inheritance reference to "BaseType"
  writer
    .createSymbol(".", "BaseType")
    .isReferencedBy(className, ReferenceKind.INHERITANCE)
    .atLocation(file.at(12, 14, 12, 21));

  // add child method "void my_method() const"
  const method = className
    .createChildSymbol("void", "my_method", "() const")
    .explicitly()
    .ofType(SymbolKind.METHOD)
    .atLocation(file.at(15, 10, 15, 18))
    .withScope(file.at(15, 5, 21, 5)) // gets highlight when active
    .withSignature(file.at(15, 5, 15, 45)); // used in tooltip

  // record usage of parameter type "bool"
  writer
    .createSymbol(".", "bool")
    .isReferencedBy(method, ReferenceKind.TYPE_USAGE)
    .atLocation(file.at(15, 20, 15, 23));

  // record parameter "do_send_signal"
  writer
    .createLocalSymbol("do_send_signal")
    .atLocation(file.at(15, 25, 15, 38))
    .atLocation(file.at(17, 13, 17, 26));

  // record source range of "Client" as qualifier location
  const qualifier = writer
    .createSymbol(".", "Client")
    .withQualifier(file.at(19, 13, 19, 18));

  // record function call reference to "send_signal()"
  qualifier
    .createChildSymbol("", "send_signal", "()")
    .ofType(SymbolKind.FUNCTION)
    .isReferencedBy(method, ReferenceKind.CALL)
    .atLocation(file.at(19, 21, 19, 31));

  // record error
  writer.recordError(
    'Really? You missed that ";" again? (intentional error)',
    file.at(22, 1, 22, 1)
  );
});

console.log("done!");
