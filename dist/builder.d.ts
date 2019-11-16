import * as i from "./index";
export declare const ReferenceKind: typeof i.ReferenceKind;
export declare const SymbolKind: typeof i.SymbolKind;
export default class WriterBuilder {
    static readonly writer: i.WriterType;
    readonly writer: i.WriterType;
    constructor();
    static getVersionString(): string;
    static getSupportedDatabaseVersion(): number;
    static open(databaseFilename: string, callback: (writer: WriterBuilder) => void, clear?: boolean, wrapInTransaction?: boolean): void;
    static openAndClear(databaseFilename: string, callback: (writer: WriterBuilder) => void, wrapInTransaction?: boolean): void;
    createReference(contextSymbol: SymbolBuilder, referencedSymbol: SymbolBuilder, referenceKind: i.ReferenceKind): ReferenceBuilder;
    createUnsolvedReference(contextSymbol: SymbolBuilder, referenceKind: i.ReferenceKind, location: i.SourceRange): ReferenceBuilder;
    createSymbol(nameHierarchy: i.NameHierarchy): SymbolBuilder;
    createSymbol(name: string): SymbolBuilder;
    createSymbol(nameDelimiter: string, name: string): SymbolBuilder;
    createSymbol(nameDelimiter: string, nameElements: i.NameElement[]): SymbolBuilder;
    createSymbol(prefix: string, name: string, postfix: string): SymbolBuilder;
    createSymbol(nameDelimiter: string, prefix: string, name: string, postfix: string): SymbolBuilder;
    createFile(filePath: string): FileBuilder;
    createLocalSymbol(name: string): LocalSymbolBuilder;
    open(databaseFilename: string): void;
    close(): void;
    clear(): void;
    isEmpty(): void;
    beginTransaction(): void;
    commitTransaction(): void;
    rollbackTransaction(): void;
    optimizeDatabaseMemory(): void;
    getVersionString(): string;
    getSupportedDatabaseVersion(): number;
    isCompatible(): boolean;
    getLoadedDatabaseVersion(): number;
    recordAtomicSourceRange(sourceRange: i.SourceRange): this;
    recordError(message: string, location: i.SourceRange): this;
    recordFatalError(message: string, location: i.SourceRange): this;
}
export declare class FileBuilder {
    readonly writer: i.WriterType;
    readonly filePath: string;
    readonly fileId: i.FileId;
    constructor(writer: i.WriterType, filePath: string);
    asLanguage(languageIdentifier: string): this;
    at(startLine: number, startColumn: number, endLine: number, endColumn: number): i.SourceRange;
}
export declare class ReferenceBuilder {
    readonly writer: i.WriterType;
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
    constructor(writer: i.WriterType, contextSymbol: SymbolBuilder, referencedSymbol: SymbolBuilder, referenceKind: i.ReferenceKind);
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
    constructor(writer: i.WriterType, contextSymbol: SymbolBuilder, location: i.SourceRange, referenceKind: i.ReferenceKind);
    atLocation(location: i.SourceRange): this;
    asAmbiguous(): this;
}
export declare class LocalSymbolBuilder {
    readonly writer: i.WriterType;
    readonly name: string;
    readonly localSymbolId: i.LocalSymbolId;
    constructor(writer: i.WriterType, name: string);
    atLocation(location: i.SourceRange): this;
}
export declare class SymbolBuilder {
    readonly writer: i.WriterType;
    readonly nameHierarchy: i.NameHierarchy;
    readonly symbolId: i.SymbolId;
    constructor(writer: i.WriterType, nameHierarchy: i.NameHierarchy);
    constructor(writer: i.WriterType, name: string);
    constructor(writer: i.WriterType, nameDelimiter: string, name: string);
    constructor(writer: i.WriterType, nameDelimiter: string, nameElements: i.NameElement[]);
    constructor(writer: i.WriterType, prefix: string, name: string, postfix: string);
    constructor(writer: i.WriterType, nameDelimiter: string, prefix: string, name: string, postfix: string);
    constructor(writer: i.WriterType, ...args: any[]);
    createChildSymbol(name: string): SymbolBuilder;
    createChildSymbol(nameElement: i.NameElement): SymbolBuilder;
    createChildSymbol(nameElements: i.NameElement[]): SymbolBuilder;
    createChildSymbol(prefix: string, name: string, postfix: string): SymbolBuilder;
    ofType(symbolKind: i.SymbolKind): this;
    withDefinition(definitionKind: i.DefinitionKind): this;
    implicitly(): this;
    explicitly(): this;
    atLocation(location: i.SourceRange): this;
    withScope(location: i.SourceRange): this;
    withQualifier(location: i.SourceRange): this;
    withSignature(location: i.SourceRange): this;
    isReferencedBy(context: SymbolBuilder, referenceKind: i.ReferenceKind): ReferenceBuilder;
    references(referencedSymbol: SymbolBuilder, referenceKind: i.ReferenceKind): ReferenceBuilder;
}
