export interface IProcessOptions {
    cmd: string;
    await?: boolean;
}
export interface IProcesses {
    [key: string]: {
        vars?: object;
        dev?: IProcessOptions;
        prod?: IProcessOptions;
        default?: IProcessOptions;
    };
}
export interface IState {
    modes: ('dev' | 'prod' | 'default')[];
    processes: {
        dev: IProcessOptions[];
        prod: IProcessOptions[];
        default: IProcessOptions[];
    };
}
