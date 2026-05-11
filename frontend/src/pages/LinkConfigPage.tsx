import Section from '../components/Section'

export default function LinkConfigPage() {
  return (
    <div>
      <Section title="🔗 四维联动配置" badge="当前状态：四个维度独立，需手动建立映射">
        <div style={{ padding: 20 }}>
          <div className="alert-row">
            <div className="alert-item alert-yellow">
              ⚠️ 四个Excel文件各自独立存在。专业→信息化→人力→财务的项目级联动映射关系需要在此手动建立
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--g500)', marginBottom: 16, lineHeight: 2 }}>
            <strong>现有硬链接(Excel中天然存在)：</strong>
            <br />
            ① 人力计划(优化11人) → 财务工资预算(449万→362万) —{' '}
            <span style={{ color: 'var(--pro)' }}>唯一可自动计算链路</span>
            <br />
            ② 人员调整计划(逐月逐人) → 财务执行时间线(人员编制与排班方案)
            <br />
            <br />
            <strong>缺失的映射(需在此配置)：</strong>
            <br />
            ③ 专业项目(16个) → 信息化子项目(17个) —{' '}
            <span style={{ color: 'var(--hr)' }}>无直接关联字段</span>
            <br />
            ④ 信息化子项目 → 人力增减 —{' '}
            <span style={{ color: 'var(--hr)' }}>无数据</span>
            <br />
            ⑤ 专业/信息化 → 单项投入产出 —{' '}
            <span style={{ color: 'var(--hr)' }}>无数据(财务是科目级,非项目级)</span>
            <br />
            <br />
            本模块将提供配置界面，由业务人员为每个专业项目手动关联：信息化方案、预期人力变化、预期投入。
          </p>
        </div>
      </Section>

      <Section title="📊 联动指标配置（待开发）">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--g500)' }}>
          联动配置功能将在后续版本中实现，敬请期待。
        </div>
      </Section>
    </div>
  )
}
