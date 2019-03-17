
/**
 * Try to create shims.
 *
 * @param src Path to program (executable or script).
 * @param to Path to shims.
 * Don't add an extension if you will create multiple types of shims.
 * @param opts Options.
 * @throws If `src` is missing.
 */
declare function cmdShim(src: string, to: string, opts: cmdShim.Options): Promise<void>;
declare namespace cmdShim {
  /**
   * Try to create shims.
   *
   * Does nothing if `src` doesn't exist.
   *
   * @param {string} src Path to program (executable or script).
   * @param {string} to Path to shims.
   * Don't add an extension if you will create multiple types of shims.
   * @param {Options} opts Options.
   */
  function cmdShimIfExists(src: string, to: string, opts: Options): Promise<void>;

  interface Options {
    /**
     * If a PowerShell script should be created.
     *
     * @default true
     */
    createPwshFile?: boolean;

    /**
     * If a Windows Command Prompt script should be created.
     *
     * @default false
     */
    createCmdFile?: boolean;

    /**
     * If symbolic links should be preserved.
     *
     * @default false
     */
    preserveSymlinks?: boolean;

    /**
     * The path to the executable file.
     */
    prog?: string;

    /**
     * The arguments to initialize the `node` process with.
     */
    args?: string;

    /**
     * The value of the $NODE_PATH environment variable.
     *
     * The single `string` format is only kept for legacy compatibility,
     * and the array form should be preferred.
     */
    nodePath?: string | string[];
  }
}

export = cmdShim;
