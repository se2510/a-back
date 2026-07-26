import {IAdminService} from "../interfaces/IAdminService";
import {User} from "../../entities/User";
import {Asset} from "../../entities/Asset";
import {GlobalConfig} from "../../entities/GlobalConfig";
import {AppDataSource} from "../../config/container";
import {Repository} from "typeorm";
import {
    ASSET_STATUS_PENDING,
    GLOBAL_CONFIG_ID,
    USER_NOT_FOUND_ERROR,
    USER_STATE_ACTIVE,
    USER_STATE_INACTIVE
} from '../../constants/admin';

export class AdminService implements IAdminService {
    private userRepo: Repository<User>;
    private assetRepo: Repository<Asset>;
    private configRepo: Repository<GlobalConfig>;

    constructor() {
        this.userRepo = AppDataSource.getRepository(User);
        this.assetRepo = AppDataSource.getRepository(Asset);
        this.configRepo = AppDataSource.getRepository(GlobalConfig);
    }

    async GetUsersByStatus(state: string): Promise<User[]> {
        return this.userRepo.find({ where: { state: state as User["state"], deleted: false } });
    }

    async ApproveUser(id: number): Promise<User> {
        await this.userRepo.update(id, { state: USER_STATE_ACTIVE, deleted: false });
        const user = await this.userRepo.findOneBy({ id });
        if (!user) throw new Error(USER_NOT_FOUND_ERROR);
        return user;
    }

    async RejectUser(id: number): Promise<User> {
        await this.userRepo.update(id, { state: USER_STATE_INACTIVE, deleted: false });
        const user = await this.userRepo.findOneBy({ id });
        if (!user) throw new Error(USER_NOT_FOUND_ERROR);
        return user;
    }

    async ChangeState(id: number): Promise<User> {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) throw new Error(USER_NOT_FOUND_ERROR);
        const newState = user.state === USER_STATE_ACTIVE ? USER_STATE_INACTIVE : USER_STATE_ACTIVE;
        await this.userRepo.update(id, { state: newState });
        return { ...user, state: newState };
    }

    async GetSettings(): Promise<GlobalConfig | null> {
        return this.configRepo.findOneBy({ id: GLOBAL_CONFIG_ID });
    }

    async UpdateSettings(config: any): Promise<GlobalConfig> {
        let globalConfig = await this.configRepo.findOneBy({ id: GLOBAL_CONFIG_ID });
        if (!globalConfig) {
            globalConfig = this.configRepo.create({ config });
        } else {
            globalConfig.config = config;
        }
        return this.configRepo.save(globalConfig);
    }

    async ListUsers(): Promise<User[]> {
        return this.userRepo.find({ where: { deleted: false } });
    }

    async DeleteOrDeactivateUser(id: number, hardDelete = false): Promise<void> {
        if (hardDelete) {
            await this.userRepo.delete(id);
        } else {
            await this.userRepo.update(id, { deleted: true, state: 'inactive' });
        }
    }

    async ListPendingContent(): Promise<Asset[]> {
        return await this.assetRepo.find({where: {moderation_status: ASSET_STATUS_PENDING}});
    }

    async ApproveAsset(assetId: number): Promise<Asset> {
        await this.assetRepo.update(assetId, { moderation_status: 'approved' });
        const asset = await this.assetRepo.findOneBy({ id: assetId });
        if (!asset) throw new Error('Asset not found');
        return asset;
    }
}