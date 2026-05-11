import type {
  ProfessionalProject,
  ITProject,
  Employee,
  DistributionItem,
  HRPlanItem,
  HRChangeItem,
  FinanceStructureItem,
  FinanceTimelinePhase,
  FinanceReductionItem,
} from '../types'

export const projData: ProfessionalProject[] = [
  { id: 1, name: '总务库房优化', dept: '综合物料库', goal: '实现库房管理智能化，减少人工操作，提高数据准确性', person: '冯秀萍', period: '约2个月', start: '5.5', end: '6.30', phases: 6, pStat: ['done', 'done', 'doing', 'todo', 'todo', 'todo'] },
  { id: 2, name: '会议室申请优化', dept: '行政事务处', goal: '简化会议室申请流程，实现自动化管控，节约能源消耗', person: '梁美珍', period: '约1个月', start: '5.5', end: '5.30', phases: 6, pStat: ['done', 'done', 'done', 'done', 'done', 'done'] },
  { id: 3, name: '车辆管理优化', dept: '行政事务处', goal: '提升用车使用效率、降低运营成本', person: '梁美珍', period: '约1个月', start: '5.10', end: '6.12', phases: 3, pStat: ['done', 'done', 'doing'] },
  { id: 4, name: '客户来访接待优化', dept: '行政事务处', goal: '提升企业对外形象、增强客户合作信任', person: '梁美珍', period: '约1个月', start: '5.10', end: '6.7', phases: 5, pStat: ['done', 'doing', 'todo', 'todo', 'todo'] },
  { id: 5, name: '公司快递收发优化', dept: '行政事务处', goal: '提升公司内部物流运作的效率与规范性', person: '梁美珍', period: '约1个月', start: '5.10', end: '6.7', phases: 5, pStat: ['done', 'doing', 'todo', 'todo', 'todo'] },
  { id: 6, name: '生产垃圾变卖优化', dept: '行政事务处', goal: '减少人工成本，提高变卖过程透明度和监管效率', person: '李彐苗', period: '约1个月', start: '5.5', end: '5.30', phases: 6, pStat: ['done', 'done', 'done', 'done', 'doing', 'todo'] },
  { id: 7, name: '宿舍申请流程优化', dept: '专项监察处', goal: '简化宿舍申请流程，实现自动化管理，提升员工满意度', person: '刁德华', period: '约2个月', start: '5.5', end: '6.25', phases: 4, pStat: ['done', 'doing', 'todo', 'todo'] },
  { id: 8, name: '食堂管理流程优化', dept: '专项监察处', goal: '提升员工用餐体验、降低运营成本', person: '刁德华', period: '约1个月', start: '5.10', end: '6.7', phases: 5, pStat: ['done', 'doing', 'todo', 'todo', 'todo'] },
  { id: 9, name: '厂区空间管控优化', dept: '专项监察处', goal: '提升厂区动线流转效率、优化空间利用率', person: '刁德华', period: '约1个月', start: '5.15', end: '6.12', phases: 3, pStat: ['plan', 'plan', 'plan'] },
  { id: 10, name: '安全环保检查优化', dept: '专项监察处', goal: '规范安全环保检查流程、降低事故率', person: '刁德华', period: '约1个月', start: '5.15', end: '6.12', phases: 4, pStat: ['plan', 'plan', 'plan', 'plan'] },
  { id: 11, name: '门禁系统升级改造', dept: '安保消防处', goal: '升级门禁系统，提升人员出入管理效率', person: '田宗贵', period: '约2个月', start: '6.1', end: '7.31', phases: 4, pStat: ['plan', 'plan', 'plan', 'plan'] },
  { id: 12, name: '消防设施完善', dept: '安保消防处', goal: '完善消防设施，确保厂区消防安全', person: '田宗贵', period: '约3个月', start: '7.1', end: '9.30', phases: 5, pStat: ['plan', 'plan', 'plan', 'plan', 'plan'] },
  { id: 13, name: '绿化养护优化', dept: '后勤保障处', goal: '优化绿化养护流程，提升园区环境质量', person: '潘明', period: '约2个月', start: '5.15', end: '7.15', phases: 4, pStat: ['done', 'doing', 'todo', 'todo'] },
  { id: 14, name: '设备维护保养优化', dept: '后勤保障处', goal: '建立设备维护保养标准流程，延长设备使用寿命', person: '潘明', period: '约2个月', start: '6.1', end: '7.31', phases: 4, pStat: ['plan', 'plan', 'plan', 'plan'] },
  { id: 15, name: '办公区域改造', dept: '后勤保障处', goal: '优化办公区域布局，提升办公效率', person: '潘明', period: '约3个月', start: '8.1', end: '10.31', phases: 5, pStat: ['plan', 'plan', 'plan', 'plan', 'plan'] },
  { id: 16, name: '园区道路修缮', dept: '后勤保障处', goal: '修缮园区道路，保障通行安全', person: '潘明', period: '约1个月', start: '9.1', end: '9.30', phases: 3, pStat: ['plan', 'plan', 'plan'] },
  { id: 17, name: '停车场管理优化', dept: '行政事务处', goal: '优化停车场管理，提高车位利用率', person: '梁美珍', period: '约1个月', start: '10.1', end: '10.31', phases: 3, pStat: ['plan', 'plan', 'plan'] },
]

export const itData: ITProject[] = [
  { id: 1, main: '后勤数字化平台建设', sub: '后勤数字化平台-一期建设', goal: '建立统一的后勤数字化管理平台', period: '5月-7月', status: 'doing', issue: '系统集成复杂度高', solve: '建立标准化接口规范' },
  { id: 2, main: '后勤数字化平台建设', sub: '后勤数字化平台-二期建设', goal: '扩展平台功能模块', period: '8月-10月', status: 'plan', issue: '需求变更频繁', solve: '建立需求变更管理机制' },
  { id: 3, main: '智能安防系统', sub: '门禁系统智能化升级', goal: '实现人员出入智能化管理', period: '6月-8月', status: 'plan', issue: '设备兼容性问题', solve: '提前进行设备兼容性测试' },
  { id: 4, main: '智能安防系统', sub: '视频监控系统完善', goal: '完善厂区视频监控覆盖', period: '5月-6月', status: 'doing', issue: '网络带宽不足', solve: '升级网络基础设施' },
  { id: 5, main: '智能安防系统', sub: '消防报警系统升级', goal: '实现消防报警智能化联动', period: '7月-9月', status: 'plan', issue: '系统联动复杂度高', solve: '分阶段实施联动测试' },
  { id: 6, main: '办公自动化系统', sub: '会议室预约系统', goal: '实现会议室智能预约管理', period: '5月', status: 'done', issue: '无', solve: '已完成' },
  { id: 7, main: '办公自动化系统', sub: '车辆调度系统', goal: '实现车辆智能调度管理', period: '5月-6月', status: 'doing', issue: 'GPS定位精度', solve: '优化定位算法' },
  { id: 8, main: '办公自动化系统', sub: '快递管理系统', goal: '实现快递收发信息化管理', period: '5月-6月', status: 'doing', issue: '扫码设备兼容性', solve: '统一设备标准' },
  { id: 9, main: '能耗管理系统', sub: '能耗监测平台建设', goal: '实现能耗实时监测与分析', period: '6月-8月', status: 'plan', issue: '数据采集难度大', solve: '部署智能采集终端' },
]

export const hrRoster: Employee[] = [
  { name: '冯秀萍', post: '主管', dept: '综合物料库', edu: '大专', age: 35, service: 5, match: '高' },
  { name: '梁美珍', post: '主管', dept: '行政事务处', edu: '本科', age: 32, service: 4, match: '高' },
  { name: '李彐苗', post: '专员', dept: '行政事务处', edu: '大专', age: 28, service: 3, match: '中' },
  { name: '刁德华', post: '主管', dept: '专项监察处', edu: '本科', age: 38, service: 6, match: '高' },
  { name: '田宗贵', post: '主管', dept: '安保消防处', edu: '大专', age: 42, service: 8, match: '中' },
  { name: '潘明', post: '主管', dept: '后勤保障处', edu: '本科', age: 34, service: 5, match: '高' },
  { name: '张艳', post: '专员', dept: '综合物料库', edu: '中专', age: 26, service: 2, match: '中' },
  { name: '王强', post: '专员', dept: '行政事务处', edu: '大专', age: 30, service: 3, match: '中' },
  { name: '刘芳', post: '专员', dept: '专项监察处', edu: '本科', age: 29, service: 2, match: '高' },
  { name: '陈明', post: '专员', dept: '安保消防处', edu: '高中', age: 31, service: 4, match: '中' },
]

export const hrDeptDist: DistributionItem[] = [
  { label: '综合物料库', count: 12, rate: '22.6%' },
  { label: '行政事务处', count: 15, rate: '28.3%' },
  { label: '专项监察处', count: 10, rate: '18.9%' },
  { label: '安保消防处', count: 8, rate: '15.1%' },
  { label: '后勤保障处', count: 8, rate: '15.1%' },
]

export const hrEduDist: DistributionItem[] = [
  { label: '本科', count: 9, rate: '17%' },
  { label: '大专', count: 25, rate: '47%' },
  { label: '中专', count: 12, rate: '23%' },
  { label: '高中', count: 7, rate: '13%' },
]

export const hrAgeDist: DistributionItem[] = [
  { label: '20-25', count: 12, rate: '23%' },
  { label: '26-30', count: 18, rate: '34%' },
  { label: '31-35', count: 14, rate: '26%' },
  { label: '36-40', count: 6, rate: '11%' },
  { label: '40+', count: 3, rate: '6%' },
]

export const hrGenderDist: DistributionItem[] = [
  { label: '男', count: 31, rate: '58%' },
  { label: '女', count: 22, rate: '42%' },
]

export const hrPlan: HRPlanItem[] = [
  { item: '在编人数', target: '48人', data: [53, 53, 53, 53, 53, 52, 51, 50, 49, 48, 48, 48] },
  { item: '优化人数', target: '11人', data: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5] },
  { item: '新增人数', target: '14人', data: [2, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0] },
  { item: '调岗人数', target: '7人', data: [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0] },
]

export const hrChange: HRChangeItem[] = [
  { name: '张艳', dept: '综合物料库', post: '专员', m4: '在岗', m5: '在岗', m6: '调岗', m7: '后勤保障处', m8: '在岗' },
  { name: '王强', dept: '行政事务处', post: '专员', m4: '在岗', m5: '在岗', m6: '在岗', m7: '在岗', m8: '优化' },
  { name: '刘芳', dept: '专项监察处', post: '专员', m4: '在岗', m5: '在岗', m6: '晋升', m7: '主管', m8: '在岗' },
]

export const finStruct: FinanceStructureItem[] = [
  { cat: '人员费用', item: '工资福利', budget: 1200, rate: '56%', compare: '-18%', strategy: '优化编制降低成本' },
  { cat: '运营费用', item: '水电费', budget: 280, rate: '13%', compare: '-5%', strategy: '节能改造' },
  { cat: '运营费用', item: '办公费', budget: 180, rate: '8%', compare: '-10%', strategy: '无纸化办公' },
  { cat: '项目费用', item: '信息化建设', budget: 300, rate: '14%', compare: '+20%', strategy: '分期投入' },
  { cat: '其他费用', item: '维修维护', budget: 179, rate: '8%', compare: '-8%', strategy: '预防性维护' },
]

export const finTimeline: FinanceTimelinePhase[] = [
  { phase: '第一阶段', date: '2026.5-6', items: ['专业项目启动', '信息化方案设计', '人员编制优化'] },
  { phase: '第二阶段', date: '2026.7-8', items: ['项目全面推进', '系统开发实施', '预算执行监控'] },
  { phase: '第三阶段', date: '2026.9-10', items: ['项目验收交付', '系统上线运行', '效果评估'] },
  { phase: '第四阶段', date: '2026.11-12', items: ['总结复盘', '预算调整', '下年度规划'] },
  { phase: '第五阶段', date: '2027.1-3', items: ['长效运营', '持续优化', '绩效考核'] },
]

export const finReduction: FinanceReductionItem[] = [
  { subject: '工资福利', prev: 1467, curr: 1200, change: '-18%', detail: '优化11人编制', level: 'P0', plan: '通过岗位合并、流程优化减少编制' },
  { subject: '水电费', prev: 295, curr: 280, change: '-5%', detail: '节能改造', level: 'P1', plan: '更换LED灯具、优化空调使用' },
  { subject: '办公费', prev: 200, curr: 180, change: '-10%', detail: '无纸化办公', level: 'P1', plan: '推广电子审批、减少纸质文件' },
  { subject: '差旅费', prev: 150, curr: 130, change: '-13%', detail: '视频会议替代', level: 'P2', plan: '加强差旅审批管控' },
  { subject: '维修费', prev: 195, curr: 179, change: '-8%', detail: '预防性维护', level: 'P2', plan: '建立设备定期保养制度' },
]

export const pageTitles: Record<string, string> = {
  dash: '📊 驾驶舱总览',
  pro: '📋 专业项目管理',
  it: '💻 信息化方案管理',
  hr: '👥 人力资源管理',
  fin: '💰 财务管控',
  link: '🔗 四维联动配置',
}

export function calcProgress(pStat: ProfessionalProject['pStat']): number {
  const done = pStat.filter((s) => s === 'done').length
  return Math.round((done / pStat.length) * 100)
}
