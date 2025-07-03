export function SetupWizard(props:{
    teams:Team[]; setTeams:(t:Team[])=>void;
    partners:Partner[]; setPartners:(p:Partner[])=>void;
    jury:JuryMember[]; setJury:(j:JuryMember[])=>void;
    presenter:{name:string;photo:string}; setPresenter:Function;
    organizer:{name:string;photo:string}; setOrganizer:Function;
    step:number; setStep:(s:number)=>void;
    onFinish:()=>void; playClick:()=>void; muted:boolean;
}) {
    const { step, setStep, playClick, onFinish } = props;
    const next = ()=>{ playClick(); setStep(step+1) };
    const prev = ()=>{ playClick(); setStep(step-1) };

    return (
        <div className="glass p-8 rounded-lg shadow-lg">
            {/* Barre de progression */}
            <ProgressBar step={step}/>
            {/* Étape courante */}
            {step===0 && <StepTeams {...props} />}
            {step===1 && <StepPeople {...props} />}
            {step===2 && <StepPartners {...props} />}
            {step===3 && <StepJury {...props}/>}
            {step===4 && <StepSummary {...props}/>}
            {/* Boutons Précédent / Suivant ou Lancer */}
            <div className="mt-6 flex justify-between">
                {step>0 && <button onClick={prev}>← Retour</button>}
                {step<4
                    ? <button onClick={next}>Suivant →</button>
                    : <button onClick={onFinish}>Commencer la partie</button>
                }
            </div>
        </div>
    )
}
