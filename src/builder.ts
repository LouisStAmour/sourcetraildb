import * as i from "./index";

class ReferenceBuilder {
  readonly referenceId: i.ReferenceId;
  constructor(
    public readonly writer: i.WriterType,
    contextSymbol: SymbolBuilder,
    referencedSymbol: SymbolBuilder,
    referenceKind: i.ReferenceKind
  ) {
    this.referenceId = writer.recordReference(
      contextSymbol.symbolId,
      referencedSymbol.symbolId,
      referenceKind
    );
    if (this.referenceId === 0) {
      new Error(writer.getLastError());
    }
  }
  atLocation(location: i.SourceRange) {
    const success = this.writer.recordReferenceLocation(
      this.referenceId,
      location
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
}
class SymbolBuilder {
  readonly nameHierarchy: i.NameHierarchy;
  readonly symbolId: i.SymbolId;
  constructor(writer: i.WriterType, nameHierarchy: i.NameHierarchy);
  constructor(writer: i.WriterType, name: string);
  constructor(
    writer: i.WriterType,
    nameDelimiter: string,
    nameElements: i.NameElement[]
  );
  constructor(
    writer: i.WriterType,
    prefix: string,
    name: string,
    postfix: string
  );
  constructor(
    writer: i.WriterType,
    nameDelimiter: string,
    prefix: string,
    name: string,
    postfix: string
  );
  constructor(public readonly writer: i.WriterType, ...args) {
    if (args.length === 1) {
      const arg = args[0];
      if (arg instanceof i.NameHierarchy) {
        this.nameHierarchy = arg;
      } else if (typeof arg === "string") {
        this.nameHierarchy = new i.NameHierarchy("", [new i.NameElement(arg)]);
      } else {
        new Error(
          "with one argument, expecting a string or a NameHierarchy object"
        );
      }
    } else if (args.length === 2) {
      const [nameDelimiter, nameElements] = args;
      this.nameHierarchy = new i.NameHierarchy(nameDelimiter, nameElements);
    } else if (args.length === 3) {
      const [prefix, name, postfix] = args;
      this.nameHierarchy = new i.NameHierarchy("", [
        new i.NameElement(prefix, name, postfix)
      ]);
    } else if (args.length === 4) {
      const [nameDelimiter, prefix, name, postfix] = args;
      this.nameHierarchy = new i.NameHierarchy(nameDelimiter, [
        new i.NameElement(prefix, name, postfix)
      ]);
    } else {
      new Error("Unexpected number of arguments provided to constructor.");
    }
    this.symbolId = writer.recordSymbol(this.nameHierarchy);
    if (this.symbolId === 0) {
      new Error(writer.getLastError());
    }
  }
  createChildSymbol(name: string);
  createChildSymbol(nameElement: i.NameElement);
  createChildSymbol(nameElements: i.NameElement[]);
  createChildSymbol(prefix: string, name: string, postfix: string);
  createChildSymbol(...args) {
    const nameElements = [...this.nameHierarchy.nameElements];
    if (args.length === 1) {
      const arg = args[0];
      if (arg instanceof i.NameElement) {
        nameElements.push(arg);
      } else if (typeof arg === "string") {
        nameElements.push(new i.NameElement(arg));
      } else if (arg instanceof Array) {
        nameElements.concat(arg);
      } else {
        new Error(
          "with one argument, expecting a string or a NameHierarchy object"
        );
      }
    } else if (args.length === 3) {
      const [prefix, name, postfix] = args;
      nameElements.push(new i.NameElement(prefix, name, postfix));
    } else {
      new Error(
        "Unexpected number of arguments provided to createChildSymbol constructor."
      );
    }
    return new SymbolBuilder(
      this.writer,
      this.nameHierarchy.nameDelimiter,
      nameElements
    );
  }
  ofType(symbolKind: i.SymbolKind) {
    const success = this.writer.recordSymbolKind(this.symbolId, symbolKind);
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  withDefinition(definitionKind: i.DefinitionKind) {
    const success = this.writer.recordSymbolDefinitionKind(
      this.symbolId,
      definitionKind
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  implicitly() {
    return this.withDefinition(i.DefinitionKind.IMPLICIT);
  }
  explicitly() {
    return this.withDefinition(i.DefinitionKind.EXPLICIT);
  }
  atLocation(location: i.SourceRange) {
    const success = this.writer.recordSymbolLocation(this.symbolId, location);
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  withScope(location: i.SourceRange) {
    const success = this.writer.recordSymbolScopeLocation(
      this.symbolId,
      location
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  withQualifier(location: i.SourceRange) {
    const success = this.writer.recordQualifierLocation(
      this.symbolId,
      location
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  withSignature(location: i.SourceRange) {
    const success = this.writer.recordSymbolSignatureLocation(
      this.symbolId,
      location
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  isReferencedBy(context: SymbolBuilder, referenceKind: i.ReferenceKind) {
    return new ReferenceBuilder(this.writer, context, this, referenceKind);
  }
  references(referencedSymbol: SymbolBuilder, referenceKind: i.ReferenceKind) {
    return new ReferenceBuilder(
      this.writer,
      this,
      referencedSymbol,
      referenceKind
    );
  }
}

export const Builders: (
  writer: i.WriterType
) => { ReferenceBuilder; SymbolBuilder } = (writer: i.WriterType) => {
  return {
    ReferenceBuilder,
    SymbolBuilder
  };
};
