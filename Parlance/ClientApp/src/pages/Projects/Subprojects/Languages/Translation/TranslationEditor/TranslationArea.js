import Styles from "./TranslationArea.module.css"
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import i18n from "../../../../../../helpers/i18n";
import {Fragment, useEffect, useRef, useState} from "react";
import {checkTranslation} from "../../../../../../checks";
import {VerticalLayout, VerticalSpacer} from "../../../../../../components/Layouts";
import {TranslationSlateEditor} from "./TranslationSlateEditor";
import Button from "../../../../../../components/Button";
import useTranslationEntries from "./EntryUtils";
import KeyboardShortcut from "../../../../../../components/KeyboardShortcut";
import {KeyboardShortcuts, useKeyboardShortcut} from "./KeyboardShortcuts";
import SmallButton from "../../../../../../components/SmallButton";
import {Untabbable, useTabIndex} from "react-tabindex";
import BackButton from "../../../../../../components/BackButton";

function TranslationPart({
                             entry,
                             translationDirection,
                             sourceTranslation,
                             translationFileType,
                             onTranslationUpdate,
                             canEdit,
                             tabIndex
                         }) {
    const [translationContent, setTranslationContent] = useState(entry.translationContent);
    const [checkState, setCheckState] = useState([]);
    const [pluralExample, setPluralExample] = useState({});
    const [hasFocus, setHasFocus] = useState(false);
    const {language} = useParams();
    const {t} = useTranslation();
    const rootRef = useRef();
    const editorRef = useRef();
    tabIndex = useTabIndex(tabIndex);

    useEffect(() => setTranslationContent(entry.translationContent), [entry]);
    useEffect(() => setCheckState(checkTranslation(sourceTranslation, translationContent, translationFileType)), [sourceTranslation, translationContent, translationFileType]);
    useEffect(() => {
        (async () => {
            let patterns = await i18n.pluralPatterns(language);
            let numbers = patterns[entry.pluralType];
            if (numbers) {
                let explanation;
                if (numbers.length > 5) {
                    explanation = t("TRANSLATION_AREA_INDICATOR_PLURAL_FORM", {numbers: i18n.list(i18n.language, [...numbers.slice(0, 5).map(x => x.toString()), t("ET_CETERA")])})
                } else {
                    explanation = t("TRANSLATION_AREA_INDICATOR_PLURAL_FORM", {numbers: i18n.list(i18n.language, numbers.map(x => x.toString()))})
                }

                setPluralExample({
                    explanation: explanation,
                    number: numbers[Math.floor(Math.random() * numbers.length)]
                });
            } else {
                setPluralExample({});
            }
        })();
    }, [sourceTranslation, language, entry.pluralType]);

    const copySource = () => {
        editorRef.current.setContents(sourceTranslation);
        editorRef.current.forceSave();
    }

    useKeyboardShortcut(KeyboardShortcuts.CopySource, copySource, hasFocus);

    const textChange = (text) => {
        setTranslationContent(text);
    }

    let headings = [t("TRANSLATION_AREA_TITLE", {lang: i18n.humanReadableLocale(language)})]
    if (pluralExample?.explanation) headings.push(pluralExample.explanation);


    const focus = () => {
        setHasFocus(true);
    }

    const blur = e => {
        if (!rootRef.current.contains(e.relatedTarget))
            setHasFocus(false)
    }

    return <div className={`${Styles.translationContainer} ${hasFocus && Styles.focus}`} onBlur={blur} onFocus={focus}
                ref={rootRef}>
        <div className={Styles.translationPart}>
            <div className={Styles.translationPartIndicator}>{headings.map((item, index) => {
                if (index === 0) {
                    return <span key={index}>{item}</span>
                } else {
                    return <Fragment key={index}>
                        <span>&nbsp;&#8226;&nbsp;</span>
                        <span className={Styles.translationPartIndicatorExtras}>{item}</span>
                    </Fragment>
                }
            })}</div>
            <TranslationSlateEditor ref={editorRef} tabIndex={tabIndex} hasFocus={hasFocus} value={translationContent}
                                    translationFileType={translationFileType}
                                    translationDirection={translationDirection} readOnly={!canEdit}
                                    onTranslationUpdate={onTranslationUpdate} onChange={textChange}
                                    pluralExample={pluralExample?.number !== undefined ? i18n.number(language, pluralExample.number) : null}
            />
            {checkState.length > 0 && <div className={Styles.checksContainer}>
                {checkState.map((check, idx) => {
                    let classes = [Styles.checkItem];
                    if (check.checkSeverity === "warn") classes.push(Styles.checkWarn);
                    if (check.checkSeverity === "error") classes.push(Styles.checkError);

                    return <div className={classes.join(" ")} key={idx}>
                        <span className={Styles.checkIcon}/>
                        <span>{check.message}</span>
                    </div>
                })}
            </div>}
        </div>
        <div className={Styles.controlsContainerWrapper}>
            <div className={Styles.controlsContainer}>
                <SmallButton tabIndex={-1}
                             onClick={copySource}>{t("Copy Source")}<KeyboardShortcut
                    shortcut={KeyboardShortcuts.CopySource}/></SmallButton>
            </div>
        </div>
    </div>
}

export default function TranslationArea({
                                            entries,
                                            translationDirection,
                                            translationFileType,
                                            onPushUpdate,
                                            canEdit,
                                            tabIndex,
                                            searchParams
                                        }) {
    const {key} = useParams();
    const [translations, setTranslations] = useState([]);
    const {t} = useTranslation();
    const {
        entry,
        prev,
        next,
        nextUnfinished,
        prevUnfinished,
        goToPrev,
        goToNext,
        goToPrevUnfinished,
        goToNextUnfinished
    } = useTranslationEntries(entries, searchParams, translationFileType, onPushUpdate);
    const navigate = useNavigate();
    tabIndex = useTabIndex(tabIndex);

    if (!entry) {
        if (key) {
            return <div className={Styles.translationArea}>
                {t("TRANSLATION_NOT_FOUND")}
            </div>
        }
        return <div className={Styles.translationArea}/>
    }

    let statusAlerts = [];
    if (!canEdit) {
        statusAlerts.push(<div className={Styles.statusAlert} key={"readonlyAlert"}>
            <VerticalLayout>
                <b>{t("HEADS_UP")}</b>
                <span>{t("READ_ONLY_TRANSLATION_EXPLANATION")}</span>
            </VerticalLayout>
        </div>);
    }

    return <div className={`${Styles.translationArea} ${key && Styles.haveKey}`}>
        <div className={Styles.translationAreaInner}>
            <BackButton className={Styles.backButton} text={t("BACK")} inTranslationView={true}
                        onClick={() => navigate(`../translate`)}/>
            {statusAlerts}
            <div className={Styles.sourceTranslationContainer}>
                <div className={Styles.sourceTranslationContainerInner}>
                    <div
                        className={Styles.sourceTranslationIndicator}>{t("TRANSLATION_AREA_SOURCE_TRANSLATION_TITLE")}</div>
                    <Untabbable>
                        <TranslationSlateEditor tabIndex={tabIndex} value={entry.source}
                                                diffWith={entry.oldSourceString}
                                                translationFileType={translationFileType}
                                                translationDirection={translationDirection} readOnly={true}
                                                onChange={() => {
                                                }}/>
                    </Untabbable>
                </div>
                <div className={Styles.keyContainer}>
                    <span className={Styles.keyText}>{entry.key}</span>
                </div>
            </div>
            {entry.translation.map((pform, idx) => {
                const translationUpdate = (contents, key) => {
                    const entry = entries.find(x => x.key === key);
                    onPushUpdate(key, {
                        translationStrings: entry.translation.map((pform2, idx2) => {
                            if (idx === idx2) {
                                return {
                                    pluralType: pform2.pluralType,
                                    translationContent: contents
                                }
                            } else {
                                return {
                                    pluralType: pform2.pluralType,
                                    translationContent: pform2.translationContent
                                }
                            }
                        })
                    });
                };

                return <TranslationPart onTranslationUpdate={translationUpdate} entry={pform} key={idx}
                                        sourceTranslation={entry.source} translationFileType={translationFileType}
                                        translationDirection={translationDirection} canEdit={canEdit}
                                        tabIndex={tabIndex}/>
            })}
            <div style={{flexGrow: 1}}/>
            <div className={Styles.controls}>
                <div className={Styles.controlArea}>
                    <Button onClick={goToPrevUnfinished} disabled={!prevUnfinished}>
                        <div className={Styles.navButtonContents}>
                            <span>{t("TRANSLATION_AREA_PREVIOUS_UNFINISHED")}</span>
                            <span className={Styles.navButtonSource}>{prevUnfinished?.source}</span>
                            <KeyboardShortcut shortcut={KeyboardShortcuts.PreviousUnfinished}/>
                        </div>
                    </Button>
                </div>
                <div className={Styles.controlArea}>
                    <Button onClick={goToNextUnfinished} disabled={!nextUnfinished && !entry.oldSourceString}>
                        <div className={Styles.navButtonContents}>
                            <span>{entry.oldSourceString ? (nextUnfinished ? t("TRANSLATION_AREA_SAVE_NEXT_UNFINISHED") : t("TRANSLATION_AREA_MARK_COMPLETE")) : t("TRANSLATION_AREA_NEXT_UNFINISHED")}</span>
                            <span className={Styles.navButtonSource}>{nextUnfinished?.source}</span>
                            <VerticalSpacer height={2}/>
                            <KeyboardShortcut shortcut={KeyboardShortcuts.NextUnfinished}/>
                        </div>
                    </Button>
                </div>
            </div>
            <div className={Styles.controls}>
                <div className={Styles.controlArea}>
                    <Button onClick={goToPrev} disabled={!prev}>
                        <div className={Styles.navButtonContents}>
                            <span>{t("TRANSLATION_AREA_PREVIOUS")}</span>
                            <span className={Styles.navButtonSource}>{prev?.source}</span>
                            <KeyboardShortcut shortcut={KeyboardShortcuts.Previous}/>
                        </div>
                    </Button>
                </div>
                <div className={Styles.controlArea}>
                    <Button onClick={goToNext} disabled={!next}>
                        <div className={Styles.navButtonContents}>
                            <span>{t("TRANSLATION_AREA_NEXT")}</span>
                            <span className={Styles.navButtonSource}>{next?.source}</span>
                            <KeyboardShortcut shortcut={KeyboardShortcuts.Next}/>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    </div>
}