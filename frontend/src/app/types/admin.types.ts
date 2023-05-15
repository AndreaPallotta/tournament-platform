export enum AdminPage {
    PERMISSIONS = 'Manage Roles',
    CRUD = 'CRUD Operations',
    LOGS = 'Logs & Audits',
    ANALYTICS = 'Analytics',
    SERVER = 'Infrastructure Status'
};

export interface UserTableRecord {
    id: string;
    email?: string | undefined;
    role: string;
};

export interface RoleUpdateErrors {
    count: number;
    ids: string[];
};

export interface RoleUpdateRes {
    success: number;
    errors: RoleUpdateErrors;
};

export interface DockerInfo {
    'App Armor': string;
    'Exposed Ports': string[];
    IP: string;
    Id: string;
    Image: string;
    Name: string;
    'Started At': string;
    Status: string;
};

export interface Ec2Info {
    'Instance ID': string;
    'Instance Name': string;
    'Instance Type': string;
    LaunchTime: string;
    'Private IP': string;
    'Public DNS': string;
    'Public IP': string;
    Status: string;
};

export interface SystemInfo {
    cpu_percent: number;
    disk: Disk;
    memory: Disk;
    net: Net;
    os: OS;
};

export interface Disk {
    Percentage: number;
    Total: number;
    Used: number;
};

export interface Net {
    'Bytes Received': number;
    'Bytes Sent': number;
};

export interface OS {
    Architecture: string[];
    'Average Load': number[];
    'Kernel Version': string;
    Uptime: string;
};

export interface ServerInfo {
    docker: DockerInfo;
    ec2: Ec2Info[];
    system_info: SystemInfo;
};

export interface GenericCount {
    [key: string]: number | 'N/A';
}

export interface Stats {
    models: GenericCount;
    roles: GenericCount;
};