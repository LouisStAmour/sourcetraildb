"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var i = tslib_1.__importStar(require("./index"));
var ReferenceBuilder = /** @class */ (function () {
    function ReferenceBuilder(writer, contextSymbol, referencedSymbol, referenceKind) {
        this.writer = writer;
        this.referenceId = writer.recordReference(contextSymbol.symbolId, referencedSymbol.symbolId, referenceKind);
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
    return ReferenceBuilder;
}());
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
            this.nameHierarchy = new i.NameHierarchy(nameDelimiter, nameElements);
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
exports.Builders = function (writer) {
    return {
        ReferenceBuilder: ReferenceBuilder,
        SymbolBuilder: SymbolBuilder
    };
};
//# sourceMappingURL=builder.js.map