import BaseRepository from './base.repository.js';
import ActivityLog from '../models/activity-log.model.js';

class ActivityLogRepository extends BaseRepository {

    constructor(){
        super(ActivityLog);
    }

}

export default ActivityLogRepository;