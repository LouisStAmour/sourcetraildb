import * as i from "./index";

export const ReferenceKind = i.ReferenceKind;
export const SymbolKind = i.SymbolKind;

export default class WriterBuilder {
  public static readonly writer: i.WriterType = new i.Writer();
  public readonly writer: i.WriterType;
  constructor() {
    this.writer = new i.Writer();
  }
  static getVersionString() {
    return WriterBuilder.writer.getVersionString();
  }
  static getSupportedDatabaseVersion() {
    return WriterBuilder.writer.getSupportedDatabaseVersion();
  }
  /* By passing a callback, you get WriterBuilder with an open database which closes automatically */
  static open(
    databaseFilename: string,
    callback: (writer: WriterBuilder) => void,
    clear: boolean = false,
    wrapInTransaction: boolean = true
  ) {
    let writer: WriterBuilder;
    try {
      writer = new WriterBuilder();
      writer.open(databaseFilename);
      if (clear) writer.clear();
      if (wrapInTransaction) {
        writer.beginTransaction();
      }
      callback(writer);
    } finally {
      if (wrapInTransaction) {
        writer.commitTransaction();
      }
      writer.close();
    }
  }
  static openAndClear(
    databaseFilename: string,
    callback: (writer: WriterBuilder) => void,
    wrapInTransaction: boolean = true
  ) {
    WriterBuilder.open(databaseFilename, callback, true, wrapInTransaction);
  }
  createReference(
    contextSymbol: SymbolBuilder,
    referencedSymbol: SymbolBuilder,
    referenceKind: i.ReferenceKind
  ) {
    return new ReferenceBuilder(
      this.writer,
      contextSymbol,
      referencedSymbol,
      referenceKind
    );
  }
  createUnsolvedReference(
    contextSymbol: SymbolBuilder,
    referenceKind: i.ReferenceKind,
    location: i.SourceRange
  ) {
    return new ReferenceBuilder(
      this.writer,
      contextSymbol,
      location,
      referenceKind
    );
  }
  createSymbol(nameHierarchy: i.NameHierarchy): SymbolBuilder;
  createSymbol(name: string): SymbolBuilder;
  createSymbol(nameDelimiter: string, name: string): SymbolBuilder;

  createSymbol(
    nameDelimiter: string,
    nameElements: i.NameElement[]
  ): SymbolBuilder;
  createSymbol(prefix: string, name: string, postfix: string): SymbolBuilder;
  createSymbol(
    nameDelimiter: string,
    prefix: string,
    name: string,
    postfix: string
  ): SymbolBuilder;
  createSymbol(...args) {
    return new SymbolBuilder(this.writer, ...args);
  }
  createFile(filePath: string) {
    return new FileBuilder(this.writer, filePath);
  }
  createLocalSymbol(name: string) {
    return new LocalSymbolBuilder(this.writer, name);
  }
  open(databaseFilename: string) {
    const success = this.writer.open(databaseFilename);
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  close() {
    const success = this.writer.close();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  clear() {
    const success = this.writer.clear();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  isEmpty() {
    const success = this.writer.isEmpty();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  beginTransaction() {
    const success = this.writer.beginTransaction();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  commitTransaction() {
    const success = this.writer.commitTransaction();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  rollbackTransaction() {
    const success = this.writer.rollbackTransaction();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  optimizeDatabaseMemory() {
    const success = this.writer.optimizeDatabaseMemory();
    if (!success) {
      new Error(this.writer.getLastError());
    }
  }
  getVersionString() {
    return this.writer.getVersionString();
  }
  getSupportedDatabaseVersion() {
    return this.writer.getSupportedDatabaseVersion();
  }
  isCompatible() {
    return this.writer.isCompatible();
  }
  getLoadedDatabaseVersion() {
    return this.writer.getLoadedDatabaseVersion();
  }
  recordAtomicSourceRange(sourceRange: i.SourceRange) {
    const success = this.writer.recordAtomicSourceRange(sourceRange);
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  recordError(message: string, location: i.SourceRange) {
    const success = this.writer.recordError(message, false, location);
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  recordFatalError(message: string, location: i.SourceRange) {
    const success = this.writer.recordError(message, true, location);
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
}

export class FileBuilder {
  readonly fileId: i.FileId;
  constructor(
    public readonly writer: i.WriterType,
    public readonly filePath: string
  ) {
    this.fileId = writer.recordFile(filePath);
    if (this.fileId === 0) {
      new Error(writer.getLastError());
    }
  }
  asLanguage(languageIdentifier: string) {
    const success = this.writer.recordFileLanguage(
      this.fileId,
      languageIdentifier
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
  at(
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number
  ) {
    return new i.SourceRange(
      this.fileId,
      startLine,
      startColumn,
      endLine,
      endColumn
    );
  }
}

export class ReferenceBuilder {
  readonly referenceId: i.ReferenceId;
  /**
   * Stores a reference between two symbols to the database
   *
   * This method allows to store the information of symbols referencing one another to the database.
   * For each recorded reference Sourcetrail's graph view will display an edge that originates at
   * the reference's recorded context symbol and points to the recorded referenced symbol. The
   * recorded ReferenceKind is used to determine the type of the displayed edge and to generate a
   * description in the hover tooltip of the edge.
   *
   *  note: Calling this method multiple times with the same input on the same Sourcetrail database
   *    will always return the same id.
   *
   *  param: contextSymbolId - the id of the source of the recorded reference edge
   *  param: referencedSymbolId - the id of the target of the recorded reference edge
   *  param: referenceKind - kind of the recorded reference edge
   *
   *  return: referenceId - integer id of the stored reference. 0 on failure. getLastError()
   *    provides the error message.
   *
   *  see: ReferenceKind
   */
  constructor(
    writer: i.WriterType,
    contextSymbol: SymbolBuilder,
    referencedSymbol: SymbolBuilder,
    referenceKind: i.ReferenceKind
  );
  /**
   * Stores a location between a specific context and an "unsolved" symbol to the database
   *
   * This method allows to store all available information to the database in the case that a symbol
   * is referenced in a certain context but the referenced symbol could not be resolved to a concrete
   * name. For each reference recorded by this method, Sourcetrail's graph view will display an edge
   * that originates at the recorded context symbol and points to a node called "unsolved symbol".
   * Furthermore Sourcetrail's code view will use a different highlight when the provided source range
   * gets hovered.
   *
   *  param: contextSymbolId - the id of the source of the recorded reference edge
   *  param: referenceKind - kind of the recorded reference edge
   *  param: location - the SourceRange that shall be recorded as location for the respective
   *    reference.
   *
   *  return: referenceId - integer id of the stored reference. 0 on failure. getLastError()
   *    provides the error message.
   *
   *  see: SourceRange
   */
  constructor(
    writer: i.WriterType,
    contextSymbol: SymbolBuilder,
    location: i.SourceRange,
    referenceKind: i.ReferenceKind
  );
  constructor(
    public readonly writer: i.WriterType,
    contextSymbol: SymbolBuilder,
    referencedSymbolOrLocation: SymbolBuilder | i.SourceRange,
    referenceKind: i.ReferenceKind
  ) {
    if (referencedSymbolOrLocation instanceof SymbolBuilder) {
      this.referenceId = writer.recordReference(
        contextSymbol.symbolId,
        referencedSymbolOrLocation.symbolId,
        referenceKind
      );
    } else {
      this.referenceId = writer.recordReferenceToUnsolvedSymhol(
        contextSymbol.symbolId,
        referenceKind,
        referencedSymbolOrLocation
      );
    }
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
  asAmbiguous() {
    const success = this.writer.recordReferenceIsAmbiguous(this.referenceId);
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
}
export class LocalSymbolBuilder {
  readonly localSymbolId: i.LocalSymbolId;
  constructor(
    public readonly writer: i.WriterType,
    public readonly name: string
  ) {
    this.localSymbolId = writer.recordLocalSymbol(name);
    if (this.localSymbolId === 0) {
      new Error(writer.getLastError());
    }
  }
  atLocation(location: i.SourceRange) {
    const success = this.writer.recordLocalSymbolLocation(
      this.localSymbolId,
      location
    );
    if (!success) {
      new Error(this.writer.getLastError());
    }
    return this;
  }
}
export class SymbolBuilder {
  readonly nameHierarchy: i.NameHierarchy;
  readonly symbolId: i.SymbolId;
  constructor(writer: i.WriterType, nameHierarchy: i.NameHierarchy);
  constructor(writer: i.WriterType, name: string);
  constructor(writer: i.WriterType, nameDelimiter: string, name: string);
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
  constructor(writer: i.WriterType, ...args);
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
      if (typeof nameElements === "string") {
        this.nameHierarchy = new i.NameHierarchy(nameDelimiter, [
          new i.NameElement(nameElements)
        ]);
      } else {
        this.nameHierarchy = new i.NameHierarchy(nameDelimiter, nameElements);
      }
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
  createChildSymbol(name: string): SymbolBuilder;
  createChildSymbol(nameElement: i.NameElement): SymbolBuilder;
  createChildSymbol(nameElements: i.NameElement[]): SymbolBuilder;
  createChildSymbol(
    prefix: string,
    name: string,
    postfix: string
  ): SymbolBuilder;
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
