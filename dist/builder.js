"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var i = tslib_1.__importStar(require("./index"));
exports.ReferenceKind = i.ReferenceKind;
exports.SymbolKind = i.SymbolKind;
var WriterBuilder = /** @class */ (function () {
    function WriterBuilder() {
        this.writer = new i.Writer();
    }
    WriterBuilder.getVersionString = function () {
        return WriterBuilder.writer.getVersionString();
    };
    WriterBuilder.getSupportedDatabaseVersion = function () {
        return WriterBuilder.writer.getSupportedDatabaseVersion();
    };
    /* By passing a callback, you get WriterBuilder with an open database which closes automatically */
    WriterBuilder.open = function (databaseFilename, callback, clear, wrapInTransaction) {
        if (clear === void 0) { clear = false; }
        if (wrapInTransaction === void 0) { wrapInTransaction = true; }
        var writer;
        try {
            writer = new WriterBuilder();
            writer.open(databaseFilename);
            if (clear)
                writer.clear();
            if (wrapInTransaction) {
                writer.beginTransaction();
            }
            callback(writer);
        }
        finally {
            if (wrapInTransaction) {
                writer.commitTransaction();
            }
            writer.close();
        }
    };
    WriterBuilder.openAndClear = function (databaseFilename, callback, wrapInTransaction) {
        if (wrapInTransaction === void 0) { wrapInTransaction = true; }
        WriterBuilder.open(databaseFilename, callback, true, wrapInTransaction);
    };
    WriterBuilder.prototype.createReference = function (contextSymbol, referencedSymbol, referenceKind) {
        return new ReferenceBuilder(this.writer, contextSymbol, referencedSymbol, referenceKind);
    };
    WriterBuilder.prototype.createUnsolvedReference = function (contextSymbol, referenceKind, location) {
        return new ReferenceBuilder(this.writer, contextSymbol, location, referenceKind);
    };
    WriterBuilder.prototype.createSymbol = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (SymbolBuilder.bind.apply(SymbolBuilder, tslib_1.__spreadArrays([void 0, this.writer], args)))();
    };
    WriterBuilder.prototype.createFile = function (filePath) {
        return new FileBuilder(this.writer, filePath);
    };
    WriterBuilder.prototype.createLocalSymbol = function (name) {
        return new LocalSymbolBuilder(this.writer, name);
    };
    WriterBuilder.prototype.open = function (databaseFilename) {
        var success = this.writer.open(databaseFilename);
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.close = function () {
        var success = this.writer.close();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.clear = function () {
        var success = this.writer.clear();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.isEmpty = function () {
        var success = this.writer.isEmpty();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.beginTransaction = function () {
        var success = this.writer.beginTransaction();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.commitTransaction = function () {
        var success = this.writer.commitTransaction();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.rollbackTransaction = function () {
        var success = this.writer.rollbackTransaction();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.optimizeDatabaseMemory = function () {
        var success = this.writer.optimizeDatabaseMemory();
        if (!success) {
            new Error(this.writer.getLastError());
        }
    };
    WriterBuilder.prototype.getVersionString = function () {
        return this.writer.getVersionString();
    };
    WriterBuilder.prototype.getSupportedDatabaseVersion = function () {
        return this.writer.getSupportedDatabaseVersion();
    };
    WriterBuilder.prototype.isCompatible = function () {
        return this.writer.isCompatible();
    };
    WriterBuilder.prototype.getLoadedDatabaseVersion = function () {
        return this.writer.getLoadedDatabaseVersion();
    };
    WriterBuilder.prototype.recordAtomicSourceRange = function (sourceRange) {
        var success = this.writer.recordAtomicSourceRange(sourceRange);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    WriterBuilder.prototype.recordError = function (message, location) {
        var success = this.writer.recordError(message, false, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    WriterBuilder.prototype.recordFatalError = function (message, location) {
        var success = this.writer.recordError(message, true, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    WriterBuilder.writer = new i.Writer();
    return WriterBuilder;
}());
exports.default = WriterBuilder;
var FileBuilder = /** @class */ (function () {
    function FileBuilder(writer, filePath) {
        this.writer = writer;
        this.filePath = filePath;
        this.fileId = writer.recordFile(filePath);
        if (this.fileId === 0) {
            new Error(writer.getLastError());
        }
    }
    FileBuilder.prototype.asLanguage = function (languageIdentifier) {
        var success = this.writer.recordFileLanguage(this.fileId, languageIdentifier);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    FileBuilder.prototype.at = function (startLine, startColumn, endLine, endColumn) {
        return new i.SourceRange(this.fileId, startLine, startColumn, endLine, endColumn);
    };
    return FileBuilder;
}());
exports.FileBuilder = FileBuilder;
var ReferenceBuilder = /** @class */ (function () {
    function ReferenceBuilder(writer, contextSymbol, referencedSymbolOrLocation, referenceKind) {
        this.writer = writer;
        if (referencedSymbolOrLocation instanceof SymbolBuilder) {
            this.referenceId = writer.recordReference(contextSymbol.symbolId, referencedSymbolOrLocation.symbolId, referenceKind);
        }
        else {
            this.referenceId = writer.recordReferenceToUnsolvedSymhol(contextSymbol.symbolId, referenceKind, referencedSymbolOrLocation);
        }
        if (this.referenceId === 0) {
            new Error(writer.getLastError());
        }
    }
    ReferenceBuilder.prototype.atLocation = function (location) {
        var success = this.writer.recordReferenceLocation(this.referenceId, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    ReferenceBuilder.prototype.asAmbiguous = function () {
        var success = this.writer.recordReferenceIsAmbiguous(this.referenceId);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    return ReferenceBuilder;
}());
exports.ReferenceBuilder = ReferenceBuilder;
var LocalSymbolBuilder = /** @class */ (function () {
    function LocalSymbolBuilder(writer, name) {
        this.writer = writer;
        this.name = name;
        this.localSymbolId = writer.recordLocalSymbol(name);
        if (this.localSymbolId === 0) {
            new Error(writer.getLastError());
        }
    }
    LocalSymbolBuilder.prototype.atLocation = function (location) {
        var success = this.writer.recordLocalSymbolLocation(this.localSymbolId, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    return LocalSymbolBuilder;
}());
exports.LocalSymbolBuilder = LocalSymbolBuilder;
var SymbolBuilder = /** @class */ (function () {
    function SymbolBuilder(writer) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.writer = writer;
        if (args.length === 1) {
            var arg = args[0];
            if (arg instanceof i.NameHierarchy) {
                this.nameHierarchy = arg;
            }
            else if (typeof arg === "string") {
                this.nameHierarchy = new i.NameHierarchy("", [new i.NameElement(arg)]);
            }
            else {
                new Error("with one argument, expecting a string or a NameHierarchy object");
            }
        }
        else if (args.length === 2) {
            var nameDelimiter = args[0], nameElements = args[1];
            if (typeof nameElements === "string") {
                this.nameHierarchy = new i.NameHierarchy(nameDelimiter, [
                    new i.NameElement(nameElements)
                ]);
            }
            else {
                this.nameHierarchy = new i.NameHierarchy(nameDelimiter, nameElements);
            }
        }
        else if (args.length === 3) {
            var prefix = args[0], name = args[1], postfix = args[2];
            this.nameHierarchy = new i.NameHierarchy("", [
                new i.NameElement(prefix, name, postfix)
            ]);
        }
        else if (args.length === 4) {
            var nameDelimiter = args[0], prefix = args[1], name = args[2], postfix = args[3];
            this.nameHierarchy = new i.NameHierarchy(nameDelimiter, [
                new i.NameElement(prefix, name, postfix)
            ]);
        }
        else {
            new Error("Unexpected number of arguments provided to constructor.");
        }
        this.symbolId = writer.recordSymbol(this.nameHierarchy);
        if (this.symbolId === 0) {
            new Error(writer.getLastError());
        }
    }
    SymbolBuilder.prototype.createChildSymbol = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var nameElements = tslib_1.__spreadArrays(this.nameHierarchy.nameElements);
        if (args.length === 1) {
            var arg = args[0];
            if (arg instanceof i.NameElement) {
                nameElements.push(arg);
            }
            else if (typeof arg === "string") {
                nameElements.push(new i.NameElement(arg));
            }
            else if (arg instanceof Array) {
                nameElements.concat(arg);
            }
            else {
                new Error("with one argument, expecting a string or a NameHierarchy object");
            }
        }
        else if (args.length === 3) {
            var prefix = args[0], name = args[1], postfix = args[2];
            nameElements.push(new i.NameElement(prefix, name, postfix));
        }
        else {
            new Error("Unexpected number of arguments provided to createChildSymbol constructor.");
        }
        return new SymbolBuilder(this.writer, this.nameHierarchy.nameDelimiter, nameElements);
    };
    SymbolBuilder.prototype.ofType = function (symbolKind) {
        var success = this.writer.recordSymbolKind(this.symbolId, symbolKind);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    SymbolBuilder.prototype.withDefinition = function (definitionKind) {
        var success = this.writer.recordSymbolDefinitionKind(this.symbolId, definitionKind);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    SymbolBuilder.prototype.implicitly = function () {
        return this.withDefinition(i.DefinitionKind.IMPLICIT);
    };
    SymbolBuilder.prototype.explicitly = function () {
        return this.withDefinition(i.DefinitionKind.EXPLICIT);
    };
    SymbolBuilder.prototype.atLocation = function (location) {
        var success = this.writer.recordSymbolLocation(this.symbolId, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    SymbolBuilder.prototype.withScope = function (location) {
        var success = this.writer.recordSymbolScopeLocation(this.symbolId, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    SymbolBuilder.prototype.withQualifier = function (location) {
        var success = this.writer.recordQualifierLocation(this.symbolId, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    SymbolBuilder.prototype.withSignature = function (location) {
        var success = this.writer.recordSymbolSignatureLocation(this.symbolId, location);
        if (!success) {
            new Error(this.writer.getLastError());
        }
        return this;
    };
    SymbolBuilder.prototype.isReferencedBy = function (context, referenceKind) {
        return new ReferenceBuilder(this.writer, context, this, referenceKind);
    };
    SymbolBuilder.prototype.references = function (referencedSymbol, referenceKind) {
        return new ReferenceBuilder(this.writer, this, referencedSymbol, referenceKind);
    };
    return SymbolBuilder;
}());
exports.SymbolBuilder = SymbolBuilder;
//# sourceMappingURL=builder.js.map